# shareMyRide
This is a highly accessible and a highly secure car-pooling node.js project(website) with multi-platform support, run on local server such as express and a database such as MongoDB.
 Step1 : If you see the Package.JSON file we can see the respective NPM packages required to be installed and this in turn would be forming the the node modules folder without which the car-pooling website cannot be launched.
 
 step2: Open you command prompt Directing to the folder where you have downloaded and saved your latest folder of the car-ppolig project.In the command prompt you install the node package manager and the go ahead and download the other packes required to run our website in your local host.
 
 Step3 : The packages required include-
          1)express (- localhost server where the website runs)
          https://www.npmjs.com/package/express
          
          2)express-handlebars (- server compatible for symantic templating support using handlebars)
          https://www.npmjs.com/package/express-handlebars
          
          3)body-parser (for recieveng the client side contents onto the server side)
          https://www.npmjs.com/package/body-parser
          
          4)cookie-parser (for recieveing the cookie details as in a middleware package)
          https://www.npmjs.com/package/cookie-parser
          
          5)handlebars -(for achieving symantic templates effectively in node.js)
          https://www.npmjs.com/package/handlebars
          
          6)mongodb- (package of the database chosen)
          https://www.npmjs.com/package/mongodb
          
          7)multer- (for achieving multi-thread data transfer,upload and download..etc)
          https://www.npmjs.com/package/multer
          
          8)node-uuid- (package for generating random ids)
          https://www.npmjs.com/package/node-uuid
          
          9)xss -(package for instilling security in the website from XSS attacks)
          https://www.npmjs.com/package/xss
          
          10)bcrypt-nodejs (package for dealing with asychronous function call)
          https://www.npmjs.com/package/bcrypt-nodejs
          
          11)async (- a package for dealing with asynchronous function calls in node.js)
          https://www.npmjs.com/package/async
          
Step4: Mongodb requires to be turned on as long as the website is tested in the local server.

Step5:after all the packes are installed , the node-modules folder will appear as a result. Now we can start the server by entering the "node app.js" in the command prompt. After which a confirmation comes in the console that 
  " We've now got a server for sharemyride project!"
  "Your routes will be running on http://localhost:3000"
  
Step6: In the browser type "http://localhost:3000/signin" and now you will be able to see the car-pooling website at your convenience. 
  
![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/firstPage.PNG)

![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/signinPage.PNG)

![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/ProfilePage.PNG)

![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/ProvidingRidePage.PNG)

![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/rideProviderProfilePicPage.PNG)

![alt text](https://github.com/anuradhakrsna/shareMyRide/blob/master/Snapshots/searchPage.PNG)
