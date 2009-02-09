/*
	Amy Editor - initial SQL script
 		MySQL 5+ version
*/

/* 
	Installation:
	open mysql console: mysql -uroot -p amy_editor
	mysql> charset utf8;
	mysql> DELIMITER $$
	mysql> \. setup_amy_editor_mysql.sql
	mysql> DELIMITER ;

/*
DROP DATABASE IF EXISTS amy_editor
$$
CREATE DATABASE  `amy_editor` DEFAULT CHARACTER SET utf8 COLLATE utf8_czech_ci;
$$

*/

DELIMITER $$

SELECT 'FUNCTION amy_util_get_random_hash' AS Creating$$
/* FUNC: util_get_random_hash
	
	Generates random 32-byte hash.

*/
DROP FUNCTION IF EXISTS amy_util_get_random_hash
$$
CREATE FUNCTION amy_util_get_random_hash
()
RETURNS
	char(32)
BEGIN

	DECLARE _r char(32);
	SET _r = md5(concat( cast(4434783*rand() AS CHAR), cast(CURRENT_TIMESTAMP AS CHAR)));
	RETURN _r;
END
$$



SELECT 'TABLE amy_user_create' AS Creating$$
/* TABLE: users */
DROP TABLE IF EXISTS amy_users
$$
CREATE TABLE amy_users
(
	id int(11) NOT NULL auto_increment,
	username varchar(64) NOT NULL,
	hashed_password char(32) NOT NULL,
	service varchar(12) NOT NULL DEFAULT 'amy' CHECK('' <> service),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	last_logged_at timestamp(0) NULL,
	email varchar(64),
	nickname varchar(48),
	picture varchar(255),
	bio text,
	PRIMARY KEY (id),
	KEY idx_users_username (username),
	UNIQUE KEY uq_username_service(username, service)
) ENGINE=InnoDB;
$$

SELECT 'amy_users' AS Populating$$

INSERT INTO amy_users(username, hashed_password, email, nickname, picture, bio) VALUES('default', md5('default'), 'info@april-child.com', 'Anonymous', 'mm/i/pictures/f.png', '')
$$
INSERT INTO amy_users(username, hashed_password, email, nickname, picture, bio) VALUES('support', md5('support'), 'info@april-child.com', 'Amy Editor Support', 'mm/i/icon-48.png', 'This is the Amy Editor support person trying to help you in case of troubles.')
$$
INSERT INTO amy_users(username, hashed_password, email, nickname, picture, bio) VALUES('p', md5('p'), 'petr@krontorad.com', 'Petr Krontorád', 'mm/i/pictures/l.png', 'Author of the editor.')
$$
INSERT INTO amy_users(username, hashed_password, email, nickname, picture, bio) VALUES('aprilchild', md5('p'), 'p@april-child.com', 'Petr @ AprilChild', 'mm/i/pictures/m.png', 'Author of the editor.')
$$


SELECT 'PROCEDURE amy_user_create' AS Creating$$
/* FUNC: user_create

	Creates new user.
	Returns newly created row record.
*/
DROP PROCEDURE IF EXISTS amy_user_create
$$
CREATE PROCEDURE amy_user_create
(
	_username varchar(64),
	_hashed_password varchar(32),
	_service varchar(12),
	_email varchar(64),
	_nickname varchar(48),
	_picture varchar(255),
	_bio text
)
BEGIN
	DECLARE	_id integer;

	INSERT INTO amy_users(username, hashed_password, service, email, nickname, picture, bio) VALUES (_username, _hashed_password, _service, _email, _nickname, _picture, _bio);
	SET _id = LAST_INSERT_ID();
	-- adding support person into addressbook
	CALL amy_user_create_relation(_id, 2);
	SELECT * FROM amy_users WHERE id=_id;
END;
$$

SELECT 'FUNCTION amy_user_delete' AS Creating$$
/* FUNC: user_delete

	Deletes user.
*/
DROP FUNCTION IF EXISTS amy_user_delete
$$
CREATE FUNCTION amy_user_delete
(
	_id integer
)
RETURNS
	char(1)

BEGIN
	DELETE FROM amy.coll_users WHERE external_ref=_id;
	DELETE FROM amy.user_relations WHERE user_id=_id OR related_user_id=_id;
	DELETE FROM amy.user_custom_relations WHERE user_id=_id;
	DELETE FROM amy.users WHERE id=_id;
	RETURN 't';
END;
$$

SELECT 'TABLE amy_user_relations' AS Creating$$
/* TABLE: user_relations */
DROP TABLE IF EXISTS amy_user_relations
$$
CREATE TABLE amy_user_relations
(
	id int(11) NOT NULL auto_increment,
	user_id int(11) NOT NULL REFERENCES amy_users(id),
	related_user_id int(11) NOT NULL REFERENCES amy_users(id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	CHECK(related_user_id<>user_id),
	PRIMARY KEY (id),
	KEY idx_user_relations_user_id (user_id),
	KEY idx_user_relations_related_user_id (related_user_id),
	UNIQUE KEY uq_user_id_related_user_id (user_id, related_user_id)
) ENGINE=InnoDB;
$$

SELECT 'TABLE amy_user_custom_relations' AS Creating$$
/* TABLE: user_custom_relations */
DROP TABLE IF EXISTS amy_user_custom_relations
$$
CREATE TABLE amy_user_custom_relations	
(
	id int(11) NOT NULL auto_increment,
	user_id int(11) NOT NULL REFERENCES amy_users(id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	nickname varchar(64) NOT NULL CHECK(nickname <> ''),
	email varchar(128) NOT NULL CHECK(email <> ''),
	PRIMARY KEY (id),
	KEY idx_user_custom_relations_user_id (user_id),
	KEY idx_user_custom_relations_email (email),
	UNIQUE KEY uq_user_id_email (user_id, email)
) ENGINE=InnoDB;
$$


SELECT 'PROCEDURE amy_user_find_relations' AS Creating$$
/* FUNC: user_find_relations

	Finds all users related to existing one. Something like address book.
*/
DROP PROCEDURE IF EXISTS amy_user_find_relations
$$
CREATE PROCEDURE amy_user_find_relations
(
	_user_id integer
)
BEGIN
	SELECT ur.related_user_id AS user_id, ur.created_at, u.username, u.service, u.email, u.nickname, u.picture FROM amy_user_relations AS ur INNER JOIN amy_users AS u ON ur.related_user_id=u.id WHERE ur.user_id=_user_id ORDER BY u.nickname;
	SELECT 0 AS user_id, ucr.created_at, '' AS username, '' AS service, ucr.email, ucr.nickname, '' FROM amy_user_custom_relations AS ucr WHERE ucr.user_id=_user_id ORDER BY ucr.nickname;
END;
$$


SELECT 'FUNCTION amy_user_create_relation' AS Creating$$
/* FUNC: user_create_relation

	Adds new user relation from existing user.
	Returns true on success.
*/
DROP FUNCTION IF EXISTS amy_user_create_relation
$$
CREATE FUNCTION amy_user_create_relation
(
	_user_id integer,
	_related_user_id integer,
	_nickname varchar(128),
	_email varchar(128)
)
RETURNS
	char(1)
BEGIN
	IF _nickname IS NULL THEN
		INSERT INTO amy_user_relations (user_id, related_user_id) VALUES (_user_id, _related_user_id);
	ELSE
		INSERT INTO amy_user_custom_relations (user_id, nickname, email) VALUES (_user_id, _nickname, _email);
	END IF;
	RETURN 't';
END;
$$


SELECT 'FUNCTION amy_user_delete_relation' AS Creating$$
/* FUNC: user_delete_relation

	Removes user relation. Takes related_user_id as parameter. Can be used for existing users only.
	Returns true on success.
*/
DROP FUNCTION IF EXISTS amy_user_delete_relation
$$
CREATE FUNCTION amy_user_delete_relation
(
	_user_id integer,
	_related_user_id integer,
	_email varchar(128)
)
RETURNS
	char(1)

BEGIN
	IF _email IS NULL THEN
		DELETE FROM amy_user_relations WHERE user_id=_user_id AND related_user_id=_related_user_id;
	ELSE
		DELETE FROM amy.user_custom_relations WHERE user_id=_user_id AND email=_email;
	END IF;
	RETURN 't';
END;
$$

SELECT 'PROCEDURE amy_user_update_relation' AS Creating$$
/* FUNC: user_update_relation

	Updates custom user relation.
	Returns true on success.
*/
DROP PROCEDURE IF EXISTS amy_user_update_relation
$$
CREATE PROCEDURE amy_user_update_relation
(
	_user_id integer,
	_original_email varchar(128),
	_nickname varchar(128),
	_email varchar(128)
)

BEGIN
	DECLARE _rel_id integer;
	DECLARE _ref_user_id integer;

	SELECT id INTO _rel_id FROM amy_user_custom_relations WHERE user_id=_user_id AND email=_original_email;
	
	IF NOT FOUND THEN
		-- checking existing users
		SELECT id INTO _ref_user_id FROM amy_users WHERE email=_email;
		IF FOUND THEN
			SELECT amy_user_create_relation(_user_id, _ref_user_id);
		ELSE
			SELECT amy_user_create_relation(_user_id, _nickname, _email);
		END IF;
	ELSE
		UPDATE amy_user_custom_relations SET nickname=_nickname, email=_email WHERE id=_rel_id;
	END IF;
	CALL amy_user_find_relations(_user_id);
	-- SELECT * FROM CALL amy_user_find_relations(_user_id) WHERE email=_email LIMIT 1;
END;
$$

SELECT amy_user_create_relation(3, 2, NULL, NULL)
$$
SELECT amy_user_create_relation(3, 4, NULL, NULL)
$$
SELECT amy_user_create_relation(4, 2, NULL, NULL)
$$
SELECT amy_user_create_relation(4, 3, NULL, NULL)
$$




DELIMITER ;