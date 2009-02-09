/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Localization support

  *------------------------------------------------------------------------------------------
*/

var client_lc = 
{


	/* Shared library widgets locale */
	
	/* *** ac.outlineview */
	loading_please_wait:{cs:'Probíhá vyhledávání, prosím, čekejte &hellip;', en:'Searching, please wait &hellip;'},

	acfilechooser_title_for_open:{cs:'Vyberte dokument', en:'Open document&hellip;'},
	acfilechooser_title_for_save:{cs:'Uložit jako soubor', en:'Save active document as&hellip;'},
	acfilechooser_button_open:{cs:'Otevřít', en:'Open Document'},
	acfilechooser_button_save:{cs:'Uložit', en:'Save Document'},
	acfilechooser_button_new_folder:{cs:'Nová složka', en:'New Folder'},
	acfilechooser_button_cancel_for_open:{cs:'Storno', en:'Cancel'},
	acfilechooser_button_cancel_for_save:{cs:'Neukládat', en:'Don\'t Save'},
	acfilechooser_label_save_as:{cs:'Uložit jako:', en:'Save As:'},

	acfilechooser_dialog_new_folder_title:{cs:'Název nové složky', en:'New folder name'},
	acfilechooser_dialog_new_folder_label:{cs:'Zadejte název nové složky:', en:'Enter new folder\'s name:'},
	acfilechooser_dialog_new_folder_butt_cancel:{cs:'Storno', en:'Cancel'},
	acfilechooser_dialog_new_folder_butt_ok:{cs:'Vytvořit složku', en:'Create New Folder'},
	acfilechooser_dialog_new_folder_label_creating:{cs:'Probíhá vytváření nové složky, čekejte prosím&hellip;', en:'Creating folder, please wait&hellip;'},
	acfilechooser_dialog_new_folder_label_creating_failed:{cs:'Nepodařilo se vytvořit novou složku.', en:'Error while creating new folder.'},

	wt_ask_document_overwrite:{cs:'Dokument existuje&hellip;', en:'Document already exists&hellip;'},
	
	h_label:{cs:'Název', en:'Name'},
	h_size:{cs:'Velikost', en:'Size'},
	h_date_modified:{cs:'Změněno', en:'Modified'},

	lU_size:{cs:'Velikost', en:'Size'},
	l_bytes:{cs:'bytů', en:'bytes'},
	
	f_bytes:{cs:'B', en:'B'},
	f_kilobytes:{cs:'KB', en:'KB'},
	f_megabytes:{cs:'MB', en:'MB'},
	
	lU_date_modified:{cs:'Změněno', en:'Modified'},
	lU_version:{cs:'Verze', en:'Version'},
	lU_content_type:{cs:'Typ', en:'Kind'},
	lU_bundle:{cs:'Balíček', en:'Bundle'},
	
	coll_status_init:{cs:'waiting for other party to join', en:'waiting for other party to join'},
	coll_status_start:{cs:'actively running', en:'actively running'},
	coll_status_stop:{cs:'has ended', en:'has ended'},
	

	preview_content_cannot_display:{cs:'Náhled nelze zobrazit.', en:'Preview cannot be displayed.'},
	preview_content_loading:{cs:'Nahrávám obsah&hellip;', en:'Content is being loaded&hellip;'},
	preview_content_error:{cs:'Nastala chyba při nahrávání obsahu&hellip;', en:'Content could not been loaded&hellip;'},

	mi_recent_searches:{cs:'Naposledy vyhledávané', en:'Recent searches'},
	mi_clear_recent_searches:{cs:'Smazat historii vyhledávání', en:'Clear recent searches'},
	
	
	mg_Amy:{cs:'Amy Editor', en:'Amy Editor'},
	mi_Amy_About:{cs:'O Amy&hellip;', en:'About Amy&hellip;'},
	mi_Amy_Preferences:{cs:'Nastavení&hellip;', en:'Preferences&hellip;'},

	mg_Identity:{cs:'Identita', en:'Identity'},
	mi_Identity_SignIn:{cs:'Přihlásit se k&hellip;', en:'Sign In&hellip;'},
	mi_Identity_Register:{cs:'Registrovat&hellip;', en:'Register&hellip;'},
	mi_Identity_SignOut:{cs:'Odhlásit se&hellip;', en:'Sign Out&hellip;'},
	mi_Identity_Notifications:{cs:'Notifikace&hellip;', en:'Notifications&hellip;'},
	mi_Identity_AddressBook:{cs:'Adresář&hellip;', en:'Address Book&hellip;'},
	mi_Identity_ChangeIcon:{cs:'Změnit ikonu&hellip;', en:'Change icon&hellip;'},

	mg_File:{cs:'Soubor', en:'File'},
	mi_File_New:{cs:'Nový', en:'New'},
	mi_File_NewFolder:{cs:'Nová složka&hellip;', en:'New Folder&hellip;'},
	mi_File_NewFromTemplate:{cs:'Nový ze šablony', en:'New From Template'},
	mi_File_NewFromDisk:{cs:'Nový z disku&hellip;', en:'New From Disk&hellip;'},
	mi_File_NewFromURL:{cs:'Nový z URL&hellip;', en:'New From URL&hellip;'},
	mi_File_OpenProject:{cs:'Otevřít projekt&hellip;', en:'Open project&hellip;'},
	mi_File_OpenFile:{cs:'Otevřít dokument&hellip;', en:'Open document&hellip;'},
	mi_File_RefreshList:{cs:'Obnovit seznam', en:'Refresh list'},	
	mi_File_Collaboration:{cs:'Spolupráce', en:'Collaboration'},
	mi_File_CollaborationInvite:{cs:'Pozvat ke spolupráci&hellip;', en:'Invite&hellip;'},
	mi_File_CollaborationAccept:{cs:'Přijmout pozvánku&hellip;', en:'Accept&hellip;'},
	mi_File_Close:{cs:'Zavřít', en:'Close'},
	mi_File_Save:{cs:'Uložit', en:'Save'},
	mi_File_SaveAs:{cs:'Uložit jako&hellip;', en:'Save As&hellip;'},
	mi_File_SaveToDisk:{cs:'Uložit na disk&hellip;', en:'Save To Disk&hellip;'},

	mg_Edit:{cs:'Editace', en:'Edit'},
	mi_Edit_Undo:{cs:'Undo', en:'Undo'},
	mi_Edit_Redo:{cs:'Redo', en:'Redo'},
	mi_Edit_Mode:{cs:'Mód', en:'Mode'},
	mi_Edit_Mode_Insert:{cs:'Vkládání', en:'Insert'},
	mi_Edit_Mode_Overwrite:{cs:'Přepisování', en:'Overwrite'},

	mi_Edit_Completion:{cs:'Doplňování slov', en:'Completion'},
	mi_Edit_Completion_Next:{cs:'Další slovo', en:'Next Completion'},
	mi_Edit_Completion_Prev:{cs:'Předchozí slovo', en:'Previous Completion'},

	
	mg_View:{cs:'Zobrazit', en:'View'},
	mi_View_Font:{cs:'Písmo&hellip;', en:'Font&hellip;'},
	mi_View_FontBigger:{cs:'Zvětšit', en:'Bigger'},
	mi_View_FontSmaller:{cs:'Zmenšit', en:'Smaller'},
	mi_View_FontDefault:{cs:'Výchozí', en:'Default'},
	mi_View_FontSelection:{cs:'Vlastní výběr', en:'Custom selection&hellip;'},

	mi_View_Wrap:{cs:'Zalamování řádků&hellip;', en:'Wrap lines&hellip;'},
	mi_View_WrapOn:{cs:'Zapnout', en:'On'},
	mi_View_WrapOff:{cs:'Vypnout', en:'Off'},
	
	mi_View_Project:{cs:'Projekty', en:'Projects'},
	mi_View_Collaboration:{cs:'Kolaborace', en:'Collaboration'},
	
	mi_View_FastFileIndex:{cs:'Rychlé vyhledání souborů', en:'Fast File Index'},
	mi_View_FastFunctionIndex:{cs:'Rychlé vyhledání funkcí', en:'Fast Function Index'},
	
	mg_Text:{cs:'Text', en:'Text'},
	
	mg_Navigation:{cs:'Navigace', en:'Navigation'},
	mi_Navigation_ToggleBookmark:{cs:'Přidat/Odebrat záložku', en:'Toggle Bookmark'},
	mi_Navigation_NextBookmark:{cs:'Další záložka', en:'Next Bookmark'},
	mi_Navigation_PrevBookmark:{cs:'Předchozí záložka', en:'Previous Bookmark'},

	mi_Navigation_NextFileTab:{cs:'Následující soubor', en:'Next File Tab'},
	mi_Navigation_PrevFileTab:{cs:'Předchozí soubor', en:'Previous File Tab'},

	mg_Bundles:{cs:'Balíčky', en:'Bundles'},
	mi_Bundles_Bundle_Editor:{cs:'Editor balíčků&hellip;', en:'Show Bundle Editor&hellip;'},
	
	
	mg_Tools:{cs:'Nástroje', en:'Tools'},
	mi_Tools_ExportSyntaxHighlighting:{cs:'Export zvýraznění syntaxe&hellip;', en:'Export syntax highlighting&hellip;'},
	
	mg_Window:{cs:'Okna', en:'Window'},
	mg_Help:{cs:'Nápověda', en:'Help'},
	mi_Help_Contents:{cs:'Obsah&hellip;', en:'Contents&hellip;'},
	mi_Help_Blog:{cs:'Blog&hellip;', en:'Blog&hellip;'},
	
	mg_Debug:{cs:'Debug', en:'Debug'},
	mi_Debug_Show_Console:{cs:'Konzole', en:'Show Console'},
	
	project_pane:{cs:'Projekty', en:'Projects'},
	collaborate_pane:{cs:'Kolaborace', en:'Collaboration'},
	
	editor_status_caret_position:{cs:'Řádek: @@row &nbsp; Sloupec: @@col', en:'Line: @@row &nbsp; Column: @@col'},
	editor_status_caret_mode_1:{cs:'VKLÁDÁNÍ', en:'INSERT'},
	editor_status_caret_mode_2:{cs:'PŘEPISOVÁNÍ', en:'OVERWRITE'},
	doc_untitled:{cs:'Nepojmenovaný', en:'Untitled'},

	flash_loading_preferences:{cs:'Nahrávám vaše nastavení&hellip;', en:'Loading your Amy preferences&hellip;'},
	flash_loading_file:{cs:'Nahrávám soubor <strong>@@name</strong>&hellip;', en:'Loading file <strong>@@name</strong>&hellip;'},
	flash_loading_new_file:{cs:'Probíhá vytváření nového souboru <strong>@@name</strong>&hellip;', en:'Creating new file <strong>@@name</strong>&hellip;'},
	flash_loading_shared_file:{cs:'Probíhá nahrávání sdíleného souboru <strong>@@name</strong>&hellip;', en:'Opening shared file <strong>@@name</strong>&hellip;'},
	flash_loading_file_failed:{cs:'Nepodařilo se nahrát soubor <strong>@@name</strong>&hellip;', en:'Error while loading file <strong>@@name</strong>&hellip;'},
	flash_saving_file:{cs:'Ukládám soubor <strong>@@name</strong>&hellip;', en:'Saving file <strong>@@name</strong>&hellip;'},
	flash_saving_file_failed:{cs:'Nepodařilo se uložit soubor <strong>@@name</strong>&hellip;', en:'Error while saving file <strong>@@name</strong>&hellip;'},
	flash_loading_bundle:{cs:'Nahrávám bundle <strong>@@name</strong>&hellip;', en:'Loading bundle <strong>@@name</strong>&hellip;'},
	flash_loading_bundle_failed:{cs:'Nepodařilo se nahrát bundle <strong>@@name</strong>&hellip;', en:'Error while loading bundle <strong>@@name</strong>&hellip;'},
	

	wt_new_filename:{cs:'Zadání názvu souboru', en:'Entering file name'},
	flash_invalid_filename:{cs:'Zadejte prosím název souboru.', en:'Please enter a filename.'},


	wt_html_page:{cs:'Náhled', en:'Preview'},
	
	wt_open_project:{cs:'Otevřít projekt', en:'Open project'},
	sc_no_project_opened:{cs:'', en:'<div class="static-content"><h5>There is currently no project opened.</h5><p>In order to start working with Amy, you need a project in which documents are collected. The project is a simple URL address.</p><p>You can open new project anytime by simply accessing <strong><span class="menu-item-name">File</span> &gt; <span class="menu-item-name">Open project&hellip;</span></strong> top menu item. You can have as many projects opened at the same time as you wish.</p><p class="explain">If you are new to Amy and have no idea of what the previous sentence was about, and all you want is to be able to play around a little, there \'s always possibility of opening the default Amy playground project (available from the Open project dialog).</p><a href="javascript:client.controller.showOpenProject()">Open a project</a><p></div>'},

	sc_no_collaboration_active:{cs:'', en:'<div class="static-content"><h5>There is currently no collaboration active.</h5><p>In order to start collaborating on a document, open one and choose <strong><span class="menu-item-name">File</span> &gt; <span class="menu-item-name">Collaboration&hellip;</span> &gt; <span class="menu-item-name">Invite&hellip;</span></strong> from the top menu.</p><p class="explain">You can have as many simultaneous collaborations as you\'d like. Both collaborations that you started and collaborations you received and accepted invitations for. You will find information about currently ongoing collaborations directly in this pane.</p>'},
	
	wt_user_sign_in:{cs:'Přihlášení', en:'Sign In'},
	wt_user_sign_out:{cs:'Odhlášení', en:'Sign Out'},
	wt_user_register:{cs:'Registrace do Amy', en:'Amy Registration'},
	wt_user_change_icon:{cs:'Změnit ikonu', en:'Change icon'},
	
	fm_user_signed_in:{cs:'Vítejte, vaše jméno je @@nickname.', en:'Welcome @@nickname.'},
	fm_user_signed_out:{cs:'Proběhlo odhlášení uživatele @@nickname.', en:'@@nickname has been signed out.'},
	fm_user_registered:{cs:'Vítejte, jste registrován pod jménem @@nickname.', en:'Welcome, you are registered as @@nickname.'},	
	fm_user_changed_icon:{cs:'Vaše ikona byla změněna.', en:'Your identity icon has changed.'},

	wt_address_book:{cs:'Adresář', en:'Address Book'},
	h_icon:{cs:'Ikona', en:'Icon'},
	h_nickname:{cs:'Jméno', en:'Name'},
	h_email:{cs:'E-mail', en:'E-mail'},
	h_info:{cs:'Info', en:'Info'},
	flash_updating_relation:{cs:'Probíhá ukládání kontaktu&hellip;', en:'Storing contact&hellip;'},
	flash_updating_relation_failed:{cs:'Nastala chyba při ukládání kontaktu&hellip;', en:'An error occured while storing contact&hellip;'},
	flash_removing_relation:{cs:'Probíhá odstraňování kontaktu&hellip;', en:'Removing contact&hellip;'},
	flash_removing_relation_failed:{cs:'Nastala chyba při odstraňování kontaktu&hellip;', en:'An error occured while removing contact&hellip;'},

	wt_collaboration_invite:{cs:'Přizvat ke spolupráci&hellip;', en:'Invite to collaboration&hellip;'},
	flash_invitation_hash:{cs:'Vygenerovaný kód pozvánky: <strong>@@hash</strong>.', en:'Generated invitation code: <strong>@@hash</strong>'},
	wt_collaboration_accept:{cs:'Akceptovat pozvánku ke spolupráci&hellip;', en:'Accept invitation to collaboration&hellip;'},
	flash_invitation_accept:{cs:'Probíhá akceptace pozvánky, čekejte prosím&hellip;', en:'Accepting your invitation code, please wait&hellip;'},
	flash_invitation_accept_succeeded:{cs:'Pozvánka akceptována, dokument se nahrává, čekejte prosím&hellip;', en:'Invitation accepted, document loading, please wait&hellip;'},
	flash_invitation_accept_failed:{cs:'Pozvánku nebylo možno akceptovat. Možné příčiny jsou přílišné stáří pozvánky, osoba, která ji zaslala již není aktivní nebo jiná chyba na serveru&hellip;', en:'Invitiation could not been accepted. Possible reasons may vary from invitation being too old, inviting person not available anymore or some kind of server error&hellip;'},
	flash_collaboration_error:{cs:'Nastala chyba při spolupráci na <strong>@@path</strong>.', en:'An error occured when collaboration on <strong>@@path</strong>.'},

	wt_bundle_editor:{cs:'Editor balíčků', en:'Bundle Editor'},
	keymap:{cs:'Mapa kláves', en:'Key map'},
	version:{cs:'Verze', en:'Version'},
	author:{cs:'Autor', en:'Author'},
	url:{cs:'WWW', en:'WWW'},
	dependencies:{cs:'Zavislosti', en:'Dependencies'},
	mi_add_bundle:{cs:'Vytvořit balíček', en:'Create new bundle'},
	mi_add_language:{cs:'Definovat nový jazyk', en:'Create new language'},
	mi_add_snippet:{cs:'Definovat nový snippet', en:'Create new snippet'},
	mi_add_command:{cs:'Definovat nový příkaz', en:'Create new command'},
	new_snippet_name:{cs:'Nový snippet', en:'New snippet'},
	new_snippet_code:{cs:'obsah vašeho snippetu', en:'your snippet content'},
	l_snippet_name:{cs:'Název snippetu', en:'Snippet name'},
	l_activation:{cs:'Aktivace', en:'Activation'},
	activation_type_0:{cs:'Tabelátorem', en:'Tab Trigger'},
	activation_type_1:{cs:'Klávesou', en:'Key equivalent'},
	butt_save_snippet:{cs:'Uložit snippet', en:'Save snippet'},
	fm_SavingSnippet:{cs:'Ukládám snippet, prosím čekejte&hellip;', en:'Saving snippet. Please wait&hellip;'},
	fm_e_SavingSnippet:{cs:'Nastala chyba při ukládání snippetu.', en:'Error occured while saving snippet.'},
	fm_DeletingSnippet:{cs:'Odstraňuji snippet, prosím čekejte&hellip;', en:'Deleting snippet. Please wait&hellip;'},
	fm_e_DeletingSnippet:{cs:'Nastala chyba při odstraňování snippetu.', en:'Error occured while deleting snippet.'},

	new_command_name:{cs:'Nový příkaz', en:'New command'},
	new_command_code:{cs:'obsah vašeho příkazu', en:'your command content'},
	l_command_name:{cs:'Název příkazu', en:'Command name'},
	l_command_input:{cs:'Vstup', en:'Input'},
	input_type_0:{cs:'Nic', en:'None'},
	input_type_1:{cs:'Označený text', en:'Selected text'},
	input_type_2:{cs:'Celý dokument', en:'Entire document'},
	l_command_input_or:{cs:'nebo', en:'or'},
	input_type_or_0:{cs:'Dokument', en:'Document'},
	input_type_or_1:{cs:'Řádka', en:'Line'},
	input_type_or_2:{cs:'Slovo', en:'Word'},
	input_type_or_3:{cs:'Znak', en:'Character'},
	input_type_or_4:{cs:'Nic', en:'Nothing'},
	l_command_output:{cs:'Výstup', en:'Output'},
	output_type_0:{cs:'Ignorovat', en:'Discard'},
	output_type_1:{cs:'Nahradit označený text', en:'Replace selected text'},
	output_type_2:{cs:'Nahradit dokument', en:'Replace document'},
	output_type_3:{cs:'Vložit jako text', en:'Insert as text'},
	output_type_4:{cs:'Vložit jako snippet', en:'Insert as snippet'},
	output_type_5:{cs:'Zobrazit jako HTML', en:'Show as HTML'},
	output_type_6:{cs:'Zobrazit jako tooltip', en:'Show as tooltip'},
	output_type_7:{cs:'Vytvořit nový dokument', en:'Create new document'},
	
	butt_save_command:{cs:'Uložit příkaz', en:'Save command'},
	fm_SavingCommand:{cs:'Ukládám příkaz, prosím čekejte&hellip;', en:'Saving command. Please wait&hellip;'},
	fm_e_SavingCommand:{cs:'Nastala chyba při ukládání příkazu.', en:'Error occured while saving command.'},
	fm_DeletingCommand:{cs:'Odstraňuji příkaz, prosím čekejte&hellip;', en:'Deleting command. Please wait&hellip;'},
	fm_e_DeletingCommand:{cs:'Nastala chyba při odstraňování příkazu.', en:'Error occured while deleting command.'},
	
	
	stop_edit_helper_only_safely_remove:0
}

function append_locale(lc)
{
	for (var i in lc)
	{
		client_lc[i] = lc[i];
	}	
}
