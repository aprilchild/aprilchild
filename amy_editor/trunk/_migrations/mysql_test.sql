DELIMITER $$

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
	IF _nickanme IS NULL THEN
		INSERT INTO amy_user_relations (user_id, related_user_id) VALUES (_user_id, _related_user_id);
	ELSE
		INSERT INTO amy_user_custom_relations (user_id, nickname, email) VALUES (_user_id, _nickname, _email);
	END IF;
	RETURN 't';
END;
$$


/* FUNC: user_delete_relation

	Removes user relation. Takes related_user_id as parameter. Can be used for existing users only.
	Returns true on success.
*/
CREATE OR REPLACE FUNCTION amy.user_delete_relation
(
	_user_id integer,
	_related_user_id integer
)
RETURNS
	boolean
AS
$$
	DECLARE

	BEGIN
		DELETE FROM amy.user_relations WHERE user_id=_user_id AND related_user_id=_related_user_id;
		RETURN true;
	END;
$$

SELECT amy_user_create_relation(3,2);
SELECT amy_user_create_relation(3,4);
SELECT amy_user_create_relation(4,2);
SELECT amy_user_create_relation(4,3);





DELIMITER ;
