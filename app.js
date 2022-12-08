//jshint esversion:6

//requiring
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash')

//setting Run time Env to express
const app = express();


//setting ejs
app.set('view engine', 'ejs');

//use bodyParser and express as a public
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todoListDB") //connecting to a MongoDb server host

// Schema & modelin Item 
const itemsSchema = {   // defining a schema
  name: String
};

const Item = mongoose.model("Item", itemsSchema)  //modeling it

//defining initial three item
const item1 = new Item({
  name: "Welcome"
})

const item2 = new Item({
  name: "Cook Food"
})

const item3 = new Item({
  name: "Eat Food"
})

// keeping initial items in an array
const defaultItems = [item1, item2, item3];

//Schema and model for dynamic list
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


// get data at root route
app.get("/", function(req, res) {

  Item.find({}, function(err, foundList){

    if(foundList.length===0){
        Item.insertMany(defaultItems, function(error){
    if (error){
      console.log("Error in insert")
    } else {
      console.log("Initial Items added")
    }
    res.redirect("/")

  })
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundList});
    }

  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today"){
    item.save()
    res.redirect("/")
  } else{
    List.findOne({name:listName }, function(err, foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/" + listName)
    })
  }

});

  app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkBox;  //itemID to get its value
    const listName = req.body.listName;  

    if(listName === "Today"){
      Item.deleteOne({_id: checkedItemId}, function(err){
        if(!err){
          console.log("Successfully deleted")
          res.redirect("/")
        }
      })
    } else { 
      List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/"+ listName)
        }
      })
    }
  })


app.get("/:customListName", function(req,res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if(!foundList){

          const list = new List({
            name: customListName,
            items: defaultItems
          })
            list.save()
            res.redirect("/" + customListName)
        } else {
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        }
      }
    })


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
