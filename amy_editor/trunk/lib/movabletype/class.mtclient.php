<?php

/************************************************
    class.mtclient.php   v1.0   5/14/2002
    kathryn aaker
    kathryn@kathrynaaker.com
    
    a subclass of bloggerclient especially for
    movabletype users.
    
    A portion of the source code in this class was developed by Bill Lazar,
    http://www.billsaysthis.com.
    Reuse of this code for any purpose is granted as long as this notice is
    included
    
    the php blogger api implementation is available here:
    http://www.dentedreality.com.au/bloggerapi/
    
    information on movabletype's xml-rpc implementation:
    http://www.movabletype.org/docs/mtmanual_programmatic.html
    
**************************************************/

/*  usage:

    requires the following files to be in the same directory:
      class.bloggerclient.php
      xmlrpc.php
    
    re-implements the following methods with metaWeblog
    which returns strings "description", "link", and "title"
    instead of a single "content" string.
    
      getRecentPosts
      getPost
      newPost
      editPost
      
 
    also adds the special movabletype methods
    which allow category assignment and retrieval
    and for listing of supported methods
      
      getCategoryList
      getPostCategories
      setPostCategories
      supportedMethods
      
      
    example:
    
    include_once("class.mtclient.php");

    $username = "myusername";
    $password = "mypassword";
    $host = "www.myhost.com";
    $path = "/path/to/mt-xmlrpc.cgi";
    
    $blog = new mtclient($username, $password, $host, $path);
    $myBlogs = $blog->getUsersBlogs();  
*/
    


include("class.bloggerclient.php");

class mtclient extends bloggerclient {

  function mtclient($username, $password, $host, $pathToXMLRPC)
  {
    $this->bServer =  $host;
    $this->bPath = $pathToXMLRPC;
    $this->app = new xmlrpcval(null, "string");
    $this->username = new xmlrpcval($username, "string");
    $this->password = new xmlrpcval($password, "string");
    
    $this->bloggerclient($username, $password);
  }

  function getRecentPosts($blogID, $numPosts)
  {
      $XMLblogid = new xmlrpcval($blogID, "string");
      $XMLnumPosts = new xmlrpcval($numPosts, "int");

      $r = new xmlrpcmsg("metaWeblog.getRecentPosts", array($XMLblogid, $this->XMLusername, $this->XMLpassword, $XMLnumPosts));
  	$r = $this->exec($r);
      return $r;
  }

  function getPost($postID)
  {
      $XMLpostid = new xmlrpcval($postID, "string");
      $r = new xmlrpcmsg("metaWeblog.getPost", array($XMLpostid, $this->XMLusername, $this->XMLpassword));
  	$r = $this->exec($r);
      return $r;
  }

  function newPost($blogID, $textPost, $publish=false)
  {
      $XMLblogid = new xmlrpcval($blogID, "string");
      $XMLcontent = new xmlrpcval($textPost, "string");
      $XMLpublish = new xmlrpcval($publish, "boolean");
      $r = new xmlrpcmsg("metaWeblog.newPost", array($XMLblogid, $this->XMLusername, $this->XMLpassword, $XMLcontent, $XMLpublish));
  	$r = $this->exec($r);
      return $r;
  }
  
  function editPost($blogID, $textPost, $publish=false)
  {
      $XMLblogid = new xmlrpcval($blogID, "string");
      $XMLcontent = new xmlrpcval($textPost, "string");
      $XMLpublish = new xmlrpcval($publish, "boolean");
      $r = new xmlrpcmsg("metaWeblog.editPost", array($XMLblogid, $this->XMLusername, $this->XMLpassword, $XMLcontent, $XMLpublish));
  	$r = $this->exec($r);
      return $r;
  }

  // methods for categories in moveabletype
  function getCategoryList($blogID)
  {
      $XMLblogid = new xmlrpcval($blogID, "string");
      $r = new xmlrpcmsg("mt.getCategoryList", array($XMLblogid, $this->XMLusername, $this->XMLpassword));
     $r = $this->exec($r);
      return $r;
  }
  
  function getPostCategories($postID)
  {
     $XMLpostid = new xmlrpcval($postID, "string");
     $r = new xmlrpcmsg("mt.getPostCategories", array($XMLpostid, $this->XMLusername, $this->XMLpassword));
     $r = $this->exec($r);
     return $r;
  }
  
  function setPostCategories($postID, $categories)
  {
     $XMLpostid = new xmlrpcval($postID, "string");
     $XMLcategories = new xmlrpcval($categories, "array");
     $r = new xmlrpcmsg("mt.setPostCategories", array($XMLpostid, $this->XMLusername, $this->XMLpassword, $XMLcategories));
     $r = $this->exec($r);
     return $r;
  }

  function getSupportedMethods()
  {
    $r = new xmlrpcmsg("mt.supportedMethods");
    $r = $this->exec($r);
    return $r;
  }
  
}


?>