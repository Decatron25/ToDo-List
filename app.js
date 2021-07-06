//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://V-chirag:nis75nis@cluster0.ahrgb.mongodb.net/todolistDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Start adding items to your list!"
});
//
// const item2 = new Item({
//   name: "Trees"
// });
//
// const item3 = new Item({
//   name: "Project research"
// });

const defaultItemsList = [item1];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItemsList, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("first 3 elements added successfully");
        }

        res.redirect("/");
      });

    } else {
      console.log(results);
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      if(err) {
        console.log(err);
      } else {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }



});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(itemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully delted one item");
      }

      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList) {
      if(err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:category", function(req, res) {

  const customListName = _.capitalize(req.params.category);

  List.findOne({ name: customListName}, function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        const newList = new List({
          name: customListName,
          items: defaultItemsList
        });
        newList.save(function(err, result) {
          res.redirect("/" + customListName);
        });

      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  });






});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
