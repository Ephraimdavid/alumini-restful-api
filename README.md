# alumini-restful-api

This is a RESTFUL API that works more like a social media API. Where users can create an account, sign in and then write and comment on posts.


ROUTE DETAILS...

method - POST
content-type - application/json
route - /users/user-comment
here we allow the user comment on individual post
honestly i don't know if i correctly created a relationship betwwen the comment
and the post to comment on @ ../models/user: line 90
create a User comment with images - POST http method


method - POST
content-type - form-data
route - /users/user-comment/pic
here the user comments with a picture if need be...nothing is coming back, 
we are just sending to database
user comment' with pic' route


method - GET 
content/type - form-data
route - /users/user-comment/:id
here we serve the image the user provided in the comment
serve up comment image - use ur browser to test this route


method - GET
content-type - application/json
route - /users/comment
here we render all the comment associated with the vaious post in our DB
read users comment - GET http method


method - GET
content-type - application/json
route - /user-coomment/:id
here we identify who wrote which comment
read a user comment by Id - GET http method


method - PATCH
content-type - application/json
route - /user-comment/:id
here we allow the user edit their individual comment
update a user comment by Id - PATCH http method


method - DELETE
content-type - application/json
route - /user-comment/:id
here we allow the user delete the comment they wrote


method - POST
content-type - application/json
route - /users/me/user-role
here the user creates and upload their post to the databse 
and we send back the created post to them
create a User post including images - POST http method


method - POST
content-type - image/png
route  - /users/me/user-role/postpicture
here the user creates/upload an image associated with their post to the database
so we have a different route that handles the image upload. while making request to this route
from the front-end, remember that you are working with the same object "UserRole", only 
that this route is solely responsble for image upload i:e userrole.postpicture prop.  if you 
are a front-end dev, you better know how to connect this form-data to the post
application/json 😂😂😜✌
user role 'with image' route


method - GET
content-type - form-data
route - /users/me/user-role/:id
here we serve up the image associated with user post.


method - DELETE
content-type - form-data
route - /users/me/user-role/postpicture/:id
here we allow users delete a certain picture associated with user post

method - GET
content-type - application/json
route - /users-role
here we pool out all post from the database and sort by first created
allow all users to read users post aspa news feed -


method - GET
content-type - application/json
allow users read post they created on their profile page
then sort - users/me/user-role_Auth?sortBy=createdAt_desc
 

method - patch
content-type - application/json
route - /users/me/user-role/:_id
here we allow the user to edit and update their postTitle and postBody 
allow users update the post they created - PATCH http method


method - DELETE
content-type - application/json
route - /users/me/user-role/:id
here the user is authorized to delete their post document, so nothing is coming back
delete post route


restrict profile pic upload - here i called the multer function which enables 
image uploads; i:e profile pictures. i also made sure that the image size should be 
<= 1.5MB 


Create a New User ROUTE
method - POST
content-type - application/json
route - /users
this is the route that handles the creation of new users, upon creating account,
the user is authenticated and logged in... 
to access the error directly from the server, target the "e.message" object converted to string


by forcing users to login, we ve created a R/ship
between users and the post they will write in the future
method - POST
content-type - application/json
route - /users/login
here the user provides their email and password to login


method - GET
content-type - application/json
route - /users/me
here the users profile is made available to them
read a user profile - GET http request


method - POST
content-type - form-data
route - /users/me/upload
here the user uploads a profile image to the database, nothing is coming back, 
we re just saving to database
upload && change profile image route


method - GET
content-type - form-data
route  - /users/:id/avatar
here we are sending back the image the user provided as a profile picture
as we serve up the image, the image ID in the database is required while targeting this route
serve up profile image


method - DELETE
content-type - form-data
route - /users/me/avatar
here the user deletes their profile picture...BYE BYE png
delete profile pcture


method  - GET
content-type - application/json
route - /users/:id
this route is specifically designed to send back a welcome message to the user,
like this..... `$Hi {user.userName}`

read a user by id and send a welcome message - GET http method


method - PATCH 
content-type - application/json
route  - /users/me
here we allow the user to update some fileds which includes...
firstName, middleName, lastName, userName, email
update a user by Id - PATCH http method


method - POST 
content-type - application/json
route - /users/forgot-passsword
route handeler coming soon...
email a token generated URL via JWT b-b /\ {$qt} = pr


method - POST
content-type - application/json
route  - /reset-password
route handeler coming soon..
  update a user password


 method - POST
content-type - application/json
route - /users/logout
here we log the user out by filtering the token in the tokens array
 ok lets kick them out when they are good to go.


method - POST
content-type - application/json
route - /users/logoutAll
here we log out all session of the app in any device by setting the tokens array
equal to an empty array
logout all session of the App in any device


method - DELETE
content-type - application/json
route - /users/me
..and the user might want to delete their profile and account in our database
we give a "go" command to that!!!
delete User Account - DELETE http method
