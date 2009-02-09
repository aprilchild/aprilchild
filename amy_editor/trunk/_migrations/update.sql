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
		_timeout interval = '20 seconds';
	
	BEGIN
		FOR _r_doc IN SELECT id, document_id, is_master_user FROM amy.coll_collaborators WHERE id=ANY(_collaborator_ids_list)
		LOOP
			_num_active := 0;
			SELECT INTO _num_active COUNT(id) FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND CURRENT_TIMESTAMP < (last_activity_at + _timeout);
			SELECT INTO _num_inactive COUNT(id) FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND CURRENT_TIMESTAMP > (last_activity_at + _timeout);
			SELECT INTO _no_master CASE WHEN CURRENT_TIMESTAMP > (last_activity_at + _timeout) THEN 't' ELSE 'f' END FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND is_master_user;
			IF _num_inactive != _num_active OR _no_master THEN
				-- number of collaborators has changed or master is not active
				-- notifying all participating collaborators, even those on the inactive list - client must commit suicide if it receives inactive_collaborator message with ID same as itself
				FOR _r IN SELECT * FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id
				LOOP
				 	PERFORM amy.coll_send_message(_r_doc.id, _r.id, 3, CASE WHEN (2 > _num_active OR _no_master) THEN ARRAY['end_collaboration', list.id::varchar] ELSE ARRAY['inactive_collaborator', list.id::varchar] END) FROM (SELECT id FROM amy.coll_collaborators WHERE document_id=_r_doc.document_id AND CURRENT_TIMESTAMP > (last_activity_at + _timeout)) AS list;
				END LOOP;
			END IF;
		END LOOP;
		RETURN 't';
	END;
$$
LANGUAGE plpgsql;
