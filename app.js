const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



main().catch(err => console.log(err));

async function main() {
  const app = express();

  // const items = ["But Food", "Cook Food", "Eat Food"];
  // const workItems = [];

  app.set("view engine", "ejs");

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));

  mongoose.connect("mongodb+srv://Admin:AAshiva%232714@cluster0.fzgwfpy.mongodb.net/todolistDB");

  const itemsSchema = new mongoose.Schema({
    name: String,
  });

  const Item = mongoose.model("item", itemsSchema);

  const i1 = new Item({
    name: "Welcome to your ToDo List!!",
  });
  const i2 = new Item({
    name: "Hit the + button to add a new item.",
  });
  const i3 = new Item({
    name: "<-- Hit this to delete an item.",
  });

  const defaultItem = [i1, i2, i3];

  const listSchema = new mongoose.Schema({
    name: String,
    item: [itemsSchema]
  });

  const List = mongoose.model("List", listSchema);

  // Item.insertMany(defaultItem);

  app.get("/", async function (req, res) {
    // const day = date.getDate();

    const show = await Item.find({});

    if (show.length === 0) {
      Item.insertMany(defaultItem);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: show});
    }
  });

  app.get("/:customListName", async function(req, res){
    const customListName = _.capitalize(req.params.customListName);



    const findListName = await List.findOne({name: customListName});
    
    if (!findListName) {
      // Create a new custom list
      const list = new List({
        name: customListName,
        item: defaultItem
      });

      list.save();

      res.redirect("/" + customListName);
    } else {
      // Show an existing list
      res.render("list", {listTitle: findListName.name, newListItems: findListName.item});
    }
    

    
  });

  app.post("/", async function (req, res) {
    const itemName = req.body.newItem;

    const listName = req.body.list;
    
    const newItem = new Item({
      name: itemName
    }); 

    if(listName === "Today"){
      newItem.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({name: listName});
      foundList.item.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    }

    
  });



  app.post("/delete", async function(req, res){
    const checkedId = req.body.checkbox;

    const listName = req.body.listName;

    if (listName === "Today") {
      const remove = await Item.findByIdAndRemove(checkedId);
      res.redirect("/");
    } else {
      const foundList = await List.findOne({name: listName});
      foundList.item.pop(Item.findByIdAndRemove(checkedId));
      foundList.save();
      res.redirect("/" + listName);
      
      // List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedId}}});
      // res.redirect("/" + listName);
    }

    
  });

  app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
  });

  app.post("/work", function (req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
  });

  app.get("/about", function (req, res) {
    res.render("about");
  });

  app.listen(3000, function () {
    console.log("Server is up and running!");
  });
}
