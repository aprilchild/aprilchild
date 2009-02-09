/*
	Amy Editor - initial SQL script
 		PostgreSQL 8+ version
*/


--DROP SCHEMA amy CASCADE;


CREATE SCHEMA amy;



/* FUNC: util_get_random_hash
	
	Generates random 32-byte hash.

*/
CREATE OR REPLACE FUNCTION amy.util_get_random_hash
(
)
RETURNS
	varchar
AS 
$$
	DECLARE
	
		_r varchar;
		
	BEGIN

		_r := md5((4434783*random())::varchar || CURRENT_TIMESTAMP::varchar);
		RETURN _r;

	END;
$$
LANGUAGE plpgsql;


/* TABLE: users */
CREATE TABLE amy.users	
(
	id SERIAL PRIMARY KEY,
	username varchar NOT NULL,
	hashed_password varchar NOT NULL,
	service varchar(12) NOT NULL DEFAULT 'amy',
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	last_logged_at timestamp(0) NULL,
	email varchar,
	nickname varchar,
	picture varchar,
	bio varchar,
	CHECK ('' <> service),
	UNIQUE(username, service)
);
CREATE INDEX idx_users_username ON amy.users(username);

INSERT INTO amy.users(username, hashed_password, email, nickname, picture, bio) VALUES('default', md5('default'), 'info@april-child.com', 'Anonymous', 'mm/i/pictures/f.png', '');
INSERT INTO amy.users(username, hashed_password, email, nickname, picture, bio) VALUES('support', md5('support'), 'info@april-child.com', 'Amy Editor Support', 'mm/i/icon-48.png', 'This is the Amy Editor support person trying to help you in case of troubles.');
INSERT INTO amy.users(username, hashed_password, email, nickname, picture, bio) VALUES('p', md5('p'), 'petr@krontorad.com', 'Petr Krontorád', 'mm/i/pictures/l.png', 'Author of the editor.');
INSERT INTO amy.users(username, hashed_password, email, nickname, picture, bio) VALUES('aprilchild', md5('p'), 'p@april-child.com', 'Petr @ AprilChild', 'mm/i/pictures/m.png', 'Author of the editor.');


/* FUNC: user_create

	Creates new user.
	Returns newly created row record.
*/
CREATE OR REPLACE FUNCTION amy.user_create
(
	_username varchar,
	_hashed_password varchar,
	_service varchar,
	_email varchar,
	_nickname varchar,
	_picture varchar,
	_bio varchar
)
RETURNS
	amy.users
AS
$$
	DECLARE
		_id integer;
		_res amy.users;

	BEGIN
		INSERT INTO amy.users(username, hashed_password, service, email, nickname, picture, bio) VALUES (_username, _hashed_password, _service, _email, _nickname, _picture, _bio);
		_id := currval('amy.users_id_seq');
		SELECT INTO _res * FROM amy.users WHERE id=_id;
		-- adding support person into addressbook
		PERFORM amy.user_create_relation(_id, 2);
		RETURN _res;
	END;
$$
LANGUAGE plpgsql;

/* FUNC: user_delete

	Deletes user.
*/
CREATE OR REPLACE FUNCTION amy.user_delete
(
	_id integer
)
RETURNS
	boolean
AS
$$
	DECLARE

	BEGIN
		DELETE FROM amy.coll_users WHERE external_ref=_id;
		DELETE FROM amy.user_relations WHERE user_id=_id OR related_user_id=_id;
		DELETE FROM amy.user_custom_relations WHERE user_id=_id;
		DELETE FROM amy.users WHERE id=_id;
		RETURN true;
	END;
$$
LANGUAGE plpgsql;


/* TABLE: user_relations */
CREATE TABLE amy.user_relations	
(
	id SERIAL PRIMARY KEY,
	user_id integer NOT NULL REFERENCES amy.users(id),
	related_user_id integer NOT NULL REFERENCES amy.users(id) CHECK(related_user_id<>user_id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(user_id, related_user_id)
);

CREATE INDEX idx_user_relations_user_id ON amy.user_relations(user_id);
CREATE INDEX idx_user_relations_related_user_id ON amy.user_relations(related_user_id);

/* TABLE: user_custom_relations */
CREATE TABLE amy.user_custom_relations	
(
	id SERIAL PRIMARY KEY,
	user_id integer NOT NULL REFERENCES amy.users(id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	nickname varchar NOT NULL CHECK(nickname <> ''),
	email varchar NOT NULL CHECK(email <> ''),
	UNIQUE(user_id, email)
);

CREATE INDEX idx_user_custom_relations_user_id ON amy.user_custom_relations(user_id);
CREATE INDEX idx_user_custom_relations_email ON amy.user_custom_relations(email);

/* TYPE: user_relation_info */
CREATE TYPE amy.user_relation_info AS
(
	user_id integer,
	created_at timestamp,
	username varchar,
	service varchar,
	email varchar,
	nickname varchar,
	picture varchar
);


/* FUNC: user_find_relations

	Finds all users related to existing one. Something like address book.
*/
CREATE OR REPLACE FUNCTION amy.user_find_relations
(
	_user_id integer
)
RETURNS
	SETOF amy.user_relation_info
AS
$$
	DECLARE
		_res amy.user_relation_info;

	BEGIN
		FOR _res IN SELECT ur.related_user_id AS user_id, ur.created_at, u.username, u.service, u.email, u.nickname, u.picture FROM amy.user_relations AS ur INNER JOIN amy.users AS u ON ur.related_user_id=u.id WHERE ur.user_id=_user_id ORDER BY u.nickname
		LOOP
			RETURN NEXT _res;
		END LOOP;
		FOR _res IN SELECT 0 AS user_id, ucr.created_at, '' AS username, '' AS service, ucr.email, ucr.nickname, '' FROM amy.user_custom_relations AS ucr WHERE ucr.user_id=_user_id ORDER BY ucr.nickname
		LOOP
			RETURN NEXT _res;
		END LOOP;
	END;
$$
LANGUAGE plpgsql;


/* FUNC: user_create_relation

	Adds new user relation from existing user.
	Returns true on success.
*/
CREATE OR REPLACE FUNCTION amy.user_create_relation
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
		INSERT INTO amy.user_relations (user_id, related_user_id) VALUES (_user_id, _related_user_id);
		RETURN true;
	END;
$$
LANGUAGE plpgsql;


/* FUNC: user_create_relation

	Adds new user relation from non-existing user.
	Returns true on success.
*/
CREATE OR REPLACE FUNCTION amy.user_create_relation
(
	_user_id integer,
	_nickname varchar,
	_email varchar
)
RETURNS
	boolean
AS
$$
	DECLARE

	BEGIN
		INSERT INTO amy.user_custom_relations (user_id, nickname, email) VALUES (_user_id, _nickname, _email);
		RETURN true;
	END;
$$
LANGUAGE plpgsql;


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
LANGUAGE plpgsql;

/* FUNC: user_delete_relation

	Removes user relation. Takes email as parameter. Can be used for custom relation users only.
	Returns true on success.
*/
CREATE OR REPLACE FUNCTION amy.user_delete_relation
(
	_user_id integer,
	_email varchar
)
RETURNS
	boolean
AS
$$
	DECLARE

	BEGIN
		DELETE FROM amy.user_custom_relations WHERE user_id=_user_id AND email=_email;
		RETURN true;
	END;
$$
LANGUAGE plpgsql;

/* FUNC: user_update_relation

	Updates custom user relation.
	Returns true on success.
*/
CREATE OR REPLACE FUNCTION amy.user_update_relation
(
	_user_id integer,
	_original_email varchar,
	_nickname varchar,
	_email varchar
)
RETURNS
	amy.user_relation_info
AS
$$
	DECLARE
		_info amy.user_relation_info;
		_rel_id integer;
		_r RECORD;
		
	BEGIN
		SELECT INTO _rel_id id FROM amy.user_custom_relations WHERE user_id=_user_id AND email=_original_email;
		IF NOT FOUND THEN
			-- checking existing users
			SELECT INTO _r id FROM amy.users WHERE email=_email;
			IF FOUND THEN
				PERFORM amy.user_create_relation(_user_id, _r.id);
			ELSE
				PERFORM amy.user_create_relation(_user_id, _nickname, _email);
			END IF;
		ELSE
			UPDATE amy.user_custom_relations SET nickname=_nickname, email=_email WHERE id=_rel_id;
		END IF;
		SELECT INTO _info * FROM amy.user_find_relations(_user_id) WHERE email=_email LIMIT 1;
		RETURN _info;
	END;
$$
LANGUAGE plpgsql;



SELECT amy.user_create_relation(3,2);
SELECT amy.user_create_relation(3,4);
SELECT amy.user_create_relation(4,2);
SELECT amy.user_create_relation(4,3);

-- 
-- /* TABLE: sessions */
-- CREATE TABLE amy.sessions	
-- (
-- 	id SERIAL PRIMARY KEY,
-- 	token varchar(32) NOT NULL UNIQUE,
-- 	user_id integer NOT NULL REFERENCES amy.users(id),
-- 	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
-- 	expired_at timestamp(0) NULL
-- );
-- CREATE INDEX idx_sessions_user_id ON amy.sessions(user_id);
-- CREATE INDEX idx_sessions_token ON amy.sessions(token);
-- 
-- 
-- /* TYPE: session_auth_info */
-- CREATE TYPE amy.session_auth_info AS
-- (
-- 	token varchar,
-- 	user_id integer,
-- 	username varchar,
-- 	service varchar,
-- 	email varchar,
-- 	nickname varchar,
-- 	expired_at timestamp
-- );
-- 
-- /* FUNC: session_authorize
-- 
-- 	Authorizes session according its token.
-- 	Returns session_auth_info on success.
-- */
-- CREATE OR REPLACE FUNCTION amy.session_authorize
-- (
-- 	_token varchar
-- )
-- RETURNS
-- 	amy.session_auth_info
-- AS
-- $$
-- 	DECLARE
-- 		_res amy.session_auth_info;
-- 
-- 	BEGIN
-- 		SELECT INTO _res s.token, s.user_id, u.username, u.service, u.email, u.nickname, s.expired_at FROM amy.sessions AS s
-- 			INNER JOIN amy.users AS u ON s.user_id=u.id
-- 				WHERE s.token=_token;
-- 				
-- 		IF NOT FOUND THEN
-- 			RAISE EXCEPTION 'Non-existent session.';
-- 		END IF;
-- 		
-- 		IF _res.expired_at < CURRENT_TIMESTAMP THEN
-- 			DELETE FROM amy.sessions WHERE token=_token;
-- 			RAISE EXCEPTION 'Session expired.';
-- 		END IF;
-- 		
-- 		RETURN _res;
-- 	END;
-- $$
-- LANGUAGE plpgsql;
-- 
-- /* FUNC: session_create
-- 
-- 	Creates new session and returns its session_auth_info on success.
-- */
-- CREATE OR REPLACE FUNCTION amy.session_create
-- (
-- 	_user_id integer
-- )
-- RETURNS
-- 	amy.session_auth_info
-- AS
-- $$
-- 	DECLARE
-- 		_token varchar;
-- 		_res amy.session_auth_info;
-- 
-- 	BEGIN
-- 		DELETE FROM amy.sessions WHERE expired_at < CURRENT_TIMESTAMP;
-- 		_token := amy.util_get_random_hash();
-- 		INSERT INTO amy.sessions(token, user_id, expired_at) VALUES (_token, _user_id, CURRENT_TIMESTAMP + '3:00');
-- 		SELECT INTO _res * FROM amy.session_authorize(_token);
-- 		RETURN _res;
-- 	END;
-- $$
-- LANGUAGE plpgsql;
-- 
-- 
-- /* FUNC: session_update
-- 
-- 	Updates existing session - renews it.
-- */
-- CREATE OR REPLACE FUNCTION amy.session_update
-- (
-- 	_token varchar
-- )
-- RETURNS
-- 	boolean
-- AS
-- $$
-- 	DECLARE
-- 		_id integer;
-- 
-- 	BEGIN
-- 		SELECT INTO _id id FROM amy.sessions WHERE token = _token;
-- 		IF NOT FOUND THEN
-- 			RAISE EXCEPTION 'Non-existent session.';
-- 		END IF;
-- 		UPDATE amy.sessions SET expired_at=CURRENT_TIMESTAMP + '3:00' WHERE id=_id;
-- 		RETURN true;
-- 	END;
-- $$
-- LANGUAGE plpgsql;


/* TABLE: coll_documents */
CREATE TABLE amy.coll_documents	
(
	id SERIAL PRIMARY KEY,
	external_project_ref varchar,
	external_document_ref varchar,
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	state integer DEFAULT 0,
	modified_at timestamp(0),
	content varchar,
	CHECK (state IN (0,1,2)) -- 0 - collaboration not started yet, 1 - running, 2 - ended
);
CREATE INDEX idx_coll_documents_external_ref ON amy.coll_documents(external_document_ref);

/* TABLE: coll_users */
CREATE TABLE amy.coll_users	
(
	id SERIAL PRIMARY KEY,
	external_ref integer NULL REFERENCES amy.users(id),
	email varchar
);
CREATE INDEX idx_coll_users_external_ref ON amy.coll_users(external_ref);

/* TABLE: coll_invitations */
CREATE TABLE amy.coll_invitations	
(
	id SERIAL PRIMARY KEY,
	hash varchar(32) NOT NULL,
	document_id integer NOT NULL REFERENCES amy.coll_documents(id),
	user_id integer NOT NULL REFERENCES amy.coll_users(id),
	permission varchar NOT NULL DEFAULT 'write',
	master_user_id integer NOT NULL REFERENCES amy.coll_users(id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	expired_at timestamp(0) NOT NULL,
	redeemed_at timestamp(0) NULL,
	message varchar
);
CREATE INDEX idx_coll_invitations_document_id ON amy.coll_invitations(document_id);
CREATE INDEX idx_coll_invitations_hash ON amy.coll_invitations(hash);
CREATE INDEX idx_coll_invitations_user_id ON amy.coll_invitations(user_id);

/* TABLE: coll_collaborators */
CREATE TABLE amy.coll_collaborators	
(
	id SERIAL PRIMARY KEY,
	document_id integer NOT NULL REFERENCES amy.coll_documents(id),
	user_id integer NOT NULL REFERENCES amy.coll_users(id),
	invitation_id integer NULL REFERENCES amy.coll_invitations(id) CHECK (NOT invitation_id IS NULL OR is_master_user),
	joined_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	last_activity_at timestamp(0),
	is_active_user boolean DEFAULT 'f',
	is_master_user boolean DEFAULT 'f'
);
CREATE INDEX idx_coll_collaborators_document_id ON amy.coll_collaborators(document_id);
CREATE INDEX idx_coll_collaborators_user_id ON amy.coll_collaborators(user_id);
CREATE INDEX idx_coll_collaborators_invitation_id ON amy.coll_collaborators(invitation_id);

/* TABLE: coll_transactions */
CREATE TABLE amy.coll_transactions
(
	id SERIAL PRIMARY KEY,
	document_id integer NOT NULL REFERENCES amy.coll_documents(id),
	collaborator_id integer NOT NULL REFERENCES amy.coll_collaborators(id),
	created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	log varchar
);
CREATE INDEX idx_coll_transactions_document_id ON amy.coll_transactions(document_id);
CREATE INDEX idx_coll_transactions_collaborator_id ON amy.coll_transactions(collaborator_id);

/* TABLE: coll_messages */
CREATE TABLE amy.coll_messages
(
	id SERIAL PRIMARY KEY,
	collaborator_sender_id integer NOT NULL REFERENCES amy.coll_collaborators(id),
	collaborator_receiver_id integer NOT NULL REFERENCES amy.coll_collaborators(id),
	sent_on timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	state integer NOT NULL DEFAULT 1, -- 0 - read, 1 - unread
	type integer NOT NULL DEFAULT 0,
	params varchar[]
);
CREATE INDEX idx_coll_messages_collaborator_sender_id ON amy.coll_messages(collaborator_sender_id);
CREATE INDEX idx_coll_messages_collaborator_receiver_id ON amy.coll_messages(collaborator_receiver_id);

/* VIEW: coll_unread_messages */
CREATE VIEW amy.coll_unread_messages AS
	SELECT * FROM amy.coll_messages WHERE state=1;

/* TYPE: coll_create_response */
CREATE TYPE amy.coll_create_response AS
(
	document_id integer,
	user_id integer,
	invitation_hash varchar,
	invitation_id integer,
	collaborator_id integer
);

/* FUNC: coll_create_user_by_email

	Creates new user or returns existing if it already exists.
	Returns user id.
*/
CREATE OR REPLACE FUNCTION amy.coll_create_user_by_email
(
	_email varchar
)
RETURNS
	integer
AS
$$
	DECLARE
		_user_id integer;

	BEGIN
		
		SELECT INTO _user_id id FROM amy.coll_users WHERE email=_email LIMIT 1;
		IF NOT FOUND THEN
			INSERT INTO amy.coll_users(external_ref, email) VALUES (NULL, _email);
			_user_id := currval('amy.coll_users_id_seq');
		END IF;
		RETURN _user_id;
	END;
$$
LANGUAGE plpgsql;

/* FUNC: coll_create_user_by_external_ref

	Creates new user or returns existing if it already exists.
	Returns user id.
*/
CREATE OR REPLACE FUNCTION amy.coll_create_user_by_external_ref
(
	_external_ref integer
)
RETURNS
	integer
AS
$$
	DECLARE
		_user_id integer;
		_email varchar;

	BEGIN
		
		SELECT INTO _user_id id FROM amy.coll_users WHERE external_ref=_external_ref LIMIT 1;
		IF NOT FOUND THEN
			SELECT INTO _email email FROM amy.users WHERE id=_external_ref;
			INSERT INTO amy.coll_users(external_ref, email) VALUES (_external_ref, _email);
			_user_id := currval('amy.coll_users_id_seq');
		END IF;
		RETURN _user_id;
	END;
$$
LANGUAGE plpgsql;

/* FUNC: coll_create

	Creates new document for collaboration.
	Returns coll_create_response.
*/
CREATE OR REPLACE FUNCTION amy.coll_create
(
	_master_external_ref integer, -- this is the user ID in amy.users table !!!
	_external_project_ref varchar,
	_external_document_ref varchar,
	_content varchar,
	_user_email varchar,
	_user_permission varchar, -- read (can only read what master writes) -- write (can participate in writing), -- execute (can also send operational messages such as "save" etc.)
	_invitation_message varchar,
	_invitation_expires_after interval
)
RETURNS
	amy.coll_create_response
AS
$$
	DECLARE
		_document_id integer;
		_master_user_id integer;
		_user_id integer;
		_invitation_id integer;
		_hash varchar;
		
		_res amy.coll_create_response;

	BEGIN
		-- creating new document
		INSERT INTO amy.coll_documents(external_project_ref, external_document_ref, content) VALUES (_external_project_ref, _external_document_ref, _content);
		_document_id := currval('amy.coll_documents_id_seq');

		-- creating master user if not existing
		_master_user_id := amy.coll_create_user_by_external_ref(_master_external_ref);
		_user_id := amy.coll_create_user_by_email(_user_email);
		
		-- creating user if not existing
		SELECT INTO _user_id id FROM amy.coll_users WHERE email=_user_email LIMIT 1;
		IF NOT FOUND THEN
			INSERT INTO amy.coll_users(email) VALUES (_user_email);
			_user_id := currval('amy.coll_users_id_seq');
		END IF;

		-- creating invitation
		_hash := amy.util_get_random_hash();
		INSERT INTO amy.coll_invitations(hash, document_id, user_id, permission, master_user_id, expired_at, message) VALUES (_hash, _document_id, _user_id, _user_permission, _master_user_id, CURRENT_TIMESTAMP+_invitation_expires_after, _invitation_message);
		_invitation_id := currval('amy.coll_invitations_id_seq');
		
		-- creating master collaborator
		INSERT INTO amy.coll_collaborators(document_id, user_id, invitation_id, last_activity_at, is_active_user, is_master_user) VALUES (_document_id, _master_user_id, _invitation_id, CURRENT_TIMESTAMP, 't', 't');		
		
		_res.document_id := _document_id;
		_res.user_id := _master_user_id;
		_res.invitation_hash := _hash;
		_res.invitation_id := _invitation_id;
		_res.collaborator_id := currval('amy.coll_collaborators_id_seq');

		RETURN _res;
	END;
$$
LANGUAGE plpgsql;


/* TYPE: coll_accept_response */
CREATE TYPE amy.coll_accept_response AS
(
	document_id integer,
	user_id integer,
	permission varchar,
	invitation_id integer,
	collaborator_id integer,
	external_document_ref varchar
);
/* FUNC: coll_accept

	Accepts invitation and send request to master. Master must confirm it and send confirmation along with actual document content.
*/
CREATE OR REPLACE FUNCTION amy.coll_accept
(
	_acceptor_external_ref integer,
	_invitation_hash varchar
)
RETURNS
	amy.coll_accept_response
AS
$$
	DECLARE
		_invitation amy.coll_invitations;
		_collaborator_id integer;
		_master_collaborator_id integer;
		_transid integer;
		_doc_state integer;
		
		_res amy.coll_accept_response;

	BEGIN
		-- check if exists
		SELECT INTO _invitation * FROM amy.coll_invitations WHERE hash=_invitation_hash;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'Invitation does not exist. Hash `%`.', _invitation_hash;
		END IF;
		
		-- check if not expired
		IF CURRENT_TIMESTAMP > _invitation.expired_at THEN
			RAISE EXCEPTION 'Invitation has expired. Hash `%`.', _invitation_hash;
		END IF;
		
		-- check if not already redeemed
		IF NOT _invitation.redeemed_at IS NULL THEN
			RAISE EXCEPTION 'Invitation has already been redeemed. Hash `%`.', _invitation_hash;
		END IF;

		-- check if not redeemed, but invitor has ended collaboration prematurely
		SELECT INTO _doc_state state FROM amy.coll_documents WHERE id=_invitation.document_id;
		IF FOUND AND 2 = _doc_state THEN
			RAISE EXCEPTION 'Collaboration prematurely stoped by its originator. Hash `%`.', _invitation_hash;
		END IF;
		
		-- getting master collaborator
		SELECT INTO _master_collaborator_id id FROM amy.coll_collaborators WHERE document_id=_invitation.document_id AND user_id=_invitation.master_user_id AND is_master_user;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'Document has no collaboration master.';
		END IF;
		
		-- updating coll_users table - external reference id
		UPDATE amy.coll_users SET external_ref=_acceptor_external_ref WHERE id=_invitation.user_id;
		
		-- adding self among collaborators
		INSERT INTO amy.coll_collaborators(document_id, user_id, invitation_id, last_activity_at) VALUES(_invitation.document_id, _invitation.user_id, _invitation.id, CURRENT_TIMESTAMP);
		_collaborator_id := currval('amy.coll_collaborators_id_seq');
		
		
		_res.document_id := _invitation.document_id;
		_res.user_id := _invitation.user_id;
		_res.permission := _invitation.permission;
		_res.invitation_id := _invitation.id;
		_res.collaborator_id := _collaborator_id;
		SELECT INTO _res.external_document_ref external_document_ref FROM amy.coll_documents WHERE id=_invitation.document_id;

		-- sending request to master
		PERFORM amy.coll_send_message(_res.collaborator_id, _master_collaborator_id, 1, ARRAY[_invitation.id::varchar]);

		-- updating invitation as being redeemed
		UPDATE amy.coll_invitations SET redeemed_at=CURRENT_TIMESTAMP WHERE id=_invitation.id;

		RETURN _res;
	END;
$$
LANGUAGE plpgsql;



/* FUNC: coll_send_message

	Sends message from a collaborator to another one.
*/
CREATE OR REPLACE FUNCTION amy.coll_send_message
(
	_collaborator_sender_id integer,
	_collaborator_receiver_id integer,
	_type integer,
	_params varchar[]
)
RETURNS
	boolean
AS
$$
	DECLARE

	BEGIN
		INSERT INTO amy.coll_messages (collaborator_sender_id, collaborator_receiver_id, type, params) VALUES (_collaborator_sender_id, _collaborator_receiver_id, _type, _params);
		RETURN 't';
	END;
$$
LANGUAGE plpgsql;



/* FUNC: coll_check_collaborations

	Checks all collaboration sessions the collaborators are participating in.
*/
CREATE OR REPLACE FUNCTION amy.coll_check_collaborations
(
	_collaborator_ids_list integer[]
)
RETURNS boolean
AS
$$
	DECLARE
		_r_doc RECORD;
		_r amy.coll_collaborators;
		_num_active integer;
		_num_inactive integer;
		_no_master boolean;
		_end_collaboration boolean;
		_timeout interval = '20 seconds';
	
	BEGIN
		FOR _r_doc IN SELECT cc.id, cc.document_id, cc.is_master_user FROM amy.coll_collaborators cc INNER JOIN amy.coll_documents AS cd ON cc.document_id=cd.id WHERE cc.id=ANY(_collaborator_ids_list) AND cd.state=1
		LOOP
			SELECT INTO _num_active COUNT(id) FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND CURRENT_TIMESTAMP < (last_activity_at + _timeout) AND is_active_user;
			SELECT INTO _num_inactive COUNT(id) FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND (CURRENT_TIMESTAMP > (last_activity_at + _timeout) OR NOT is_active_user);
			SELECT INTO _no_master CASE WHEN CURRENT_TIMESTAMP > (last_activity_at + _timeout) OR NOT is_active_user THEN 't' ELSE 'f' END FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND is_master_user;
			_end_collaboration := (2 > _num_active OR _no_master);
			IF 0 < _num_inactive OR _end_collaboration THEN
				-- number of collaborators has changed or collaboration should end
				IF _end_collaboration THEN
					UPDATE amy.coll_documents SET state=2 WHERE id=_r_doc.document_id;
				END IF;
				-- notifying all participating collaborators, even those on the inactive list - client must commit suicide if it receives inactive_collaborator message with ID same as itself
				FOR _r IN SELECT * FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id
				LOOP
					IF _end_collaboration THEN
				 		PERFORM amy.coll_send_message(_r_doc.id, _r.id, 3, ARRAY['end_collaboration']);
					ELSE
				 		PERFORM amy.coll_send_message(_r_doc.id, _r.id, 3, ARRAY['inactive_collaborator', list.id::varchar]) FROM (SELECT id FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND (CURRENT_TIMESTAMP > (last_activity_at + _timeout) OR NOT is_active_user)) AS list;
					END IF;
				END LOOP;
			END IF;
		END LOOP;
		RETURN 't';
	END;
$$
LANGUAGE plpgsql;


/* FUNC: coll_stop

	Stops collaboration for one collaborator
*/
CREATE OR REPLACE FUNCTION amy.coll_stop
(
	_collaborator_id integer
)
RETURNS boolean
AS
$$
	DECLARE
		_r_doc RECORD;
		_r amy.coll_collaborators;
		_num_active integer;
		_num_inactive integer;
		_no_master boolean;
		_end_collaboration boolean;
		_timeout interval = '20 seconds';
	
	BEGIN
		UPDATE amy.coll_collaborators SET is_active_user='f' WHERE id=_collaborator_id;
		RETURN amy.coll_check_collaborations(ARRAY[_collaborator_id]);
	END;
$$
LANGUAGE plpgsql;


/* FUNC: coll_delete_message

	Deletes message.
*/
CREATE OR REPLACE FUNCTION amy.coll_delete_message
(
	_message_id integer
)
RETURNS
	boolean
AS
$$

	BEGIN
		DELETE FROM amy.coll_messages WHERE id=_message_id;
		RETURN 't';
	END;
$$
LANGUAGE plpgsql;

/* FUNC: coll_handle_message

	Handles messages of known types.
*/
CREATE OR REPLACE FUNCTION amy.coll_handle_message
(
	_collaborator_receiver_id integer,
	_message_id integer,
	_params varchar[]
)
RETURNS
	varchar[]
AS
$$
	DECLARE
		_message amy.coll_messages;
		_r RECORD;
		_mark_read boolean = 'f';
		_response varchar[];
		_invitation amy.coll_invitations;
		_transid integer;
		_collaborator amy.coll_collaborators;

	BEGIN
		SELECT INTO _message * FROM amy.coll_messages WHERE id=_message_id AND collaborator_receiver_id=_collaborator_receiver_id;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'Message not found. ID `%`', _message_id;
		END IF;
		IF 1 = _message.type AND 1 = _message.state THEN
			-- approving invited user after s/he accepted invitation
			-- params: [remote_transid, source]
			SELECT INTO _r * FROM amy.coll_invitations WHERE id=_message.params[1]::integer;
			IF NOT FOUND THEN
				RAISE NOTICE 'Invitation not found.';
			END IF;
			UPDATE amy.coll_collaborators SET is_active_user='t' WHERE id=_message.collaborator_sender_id;
			-- sending her/him a message with current source code
			PERFORM amy.coll_send_message(_collaborator_receiver_id, _message.collaborator_sender_id, 2, _params);
			_mark_read := 't';
			
			
			
			/*
			SELECT INTO _invitation * FROM amy.coll_invitations AS ci
			 	INNER JOIN amy.coll_collaborators AS cc ON ci.id=cc.invitation_id
				WHERE cc.id=_collaborator_receiver_id AND cc.is_master_user;
			*/
			-- check to see if transaction has been started already (it means sender is not the first invited collaborator)
			IF '-1' = _params[1] THEN
				-- not started yet, will start
				-- INSERT INTO amy.coll_transactions(document_id, collaborator_id, created_at, log)
			ELSE
			
			END IF;
			
			
			
		ELSIF 2 = _message.type AND 1 = _message.state THEN
			-- joining in
			_mark_read := 't';
			SELECT INTO _collaborator * FROM amy.coll_collaborators WHERE id=_collaborator_receiver_id;
			-- alerting all collaborators about new collaborator and load user_info
			FOR _r IN SELECT id FROM amy.coll_collaborators WHERE document_id=_collaborator.document_id AND id<>_collaborator.id
			LOOP
				-- send other collaborator notification about me as a new collaborator
				PERFORM amy.coll_send_message(_collaborator.id, _r.id, 3, ARRAY['new_collaborator', _collaborator.id::varchar]);
				-- send other collaborator message about loading my user_info
				PERFORM amy.coll_send_message(_collaborator.id, _r.id, 5, ARRAY[_collaborator.id::varchar]);
				-- send myself message about loading info about other collaborator
				PERFORM amy.coll_send_message(_r.id, _collaborator.id, 5, ARRAY[_r.id::varchar]);

			END LOOP;
			-- update status of the document
			UPDATE amy.coll_documents SET state=1 WHERE id=_collaborator.document_id;
			
		ELSIF 3 = _message.type AND 1 =_message.state THEN
			-- notification
			_mark_read := 't';


		ELSIF 4 = _message.type AND 1 =_message.state THEN
			-- chat
			_mark_read := 't';
			
		
		ELSIF 5 = _message.type AND 1 =_message.state THEN
			-- user_info
			_mark_read := 't';
			-- RAISE NOTICE '%', _message.params[1];
			SELECT INTO _response ARRAY[cc.id::varchar, cc.user_id::varchar, cc.joined_at::varchar, cc.last_activity_at::varchar, CASE WHEN cc.is_master_user THEN 'true' ELSE 'false' END, u.id::varchar, cu.email::varchar, u.nickname::varchar, u.picture::varchar, (CURRENT_TIMESTAMP-cc.last_activity_at)::varchar] FROM amy.coll_collaborators AS cc INNER JOIN amy.coll_users AS cu ON cc.user_id=cu.id INNER JOIN amy.users AS u ON cu.external_ref=u.id WHERE cc.id=_message.params[1]::integer;
			-- RAISE NOTICE '%', _response;
			
		END IF;
		
		
		IF _mark_read THEN
			UPDATE amy.coll_messages SET state = 0 WHERE id=_message.id;
		END IF;
		RETURN _response;
	END;
$$
LANGUAGE plpgsql;


/* TYPE: coll_transaction_response */
CREATE TYPE amy.coll_transaction_response AS
(
	transaction_id integer,
	collaborator_id integer,
	log varchar
);
/* FUNC: coll_accept

	Accepts invitation and send request to master. Master must confirm it and send confirmation along with actual document content.
*/
CREATE OR REPLACE FUNCTION amy.coll_handle_transactions
(
	_document_id integer,
	_collaborator_id integer,
	_last_trans_id integer,
	_new_transactions varchar
)
RETURNS
	SETOF amy.coll_transaction_response
AS
$$
	DECLARE
		_r RECORD;
		_res amy.coll_transaction_response;
		_new_transactions_split varchar[];
		_i integer;

	BEGIN
		-- selecting transactions from last_trans_id excluded
		FOR _r IN SELECT id, collaborator_id, log FROM amy.coll_transactions
		 				WHERE document_id=_document_id AND collaborator_id<>_collaborator_id AND id>_last_trans_id ORDER BY id ASC
		LOOP
			_res.transaction_id := _r.id;
			_res.collaborator_id := _r.collaborator_id;
			_res.log := _r.log;
			RETURN NEXT _res;
		END LOOP;
		-- inserting new transactions
		_new_transactions_split := string_to_array(_new_transactions, E'\n');
		IF NOT array_lower(_new_transactions_split,1) IS NULL THEN
			FOR _i IN array_lower(_new_transactions_split,1) .. array_upper(_new_transactions_split,1)
			LOOP
				INSERT INTO amy.coll_transactions(document_id, collaborator_id, created_at, log) VALUES(_document_id, _collaborator_id, DEFAULT, _new_transactions_split[_i]);
			END LOOP;
		END IF;
		
		-- updating collaborator presence
		UPDATE amy.coll_collaborators SET last_activity_at=CURRENT_TIMESTAMP WHERE id=_collaborator_id;
	END;
$$
LANGUAGE plpgsql;




