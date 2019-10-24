const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override")

mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/restful_blog', { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()}
});

const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Mainecoon cats",
//     image: "https://images.unsplash.com/photo-1522224760669-4016df02b454?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//     body: "Hello this is a blog post"
// });

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (error, allBlogs) => {
        error ? console.log(error) : res.render("index", {blogs: allBlogs});
    });
});

app.get("/blogs/new", (req, res) => {
    res.render("new");
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) => {
        error ? res.redirect("/blogs") : res.render("show", {blog: foundBlog});
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) => {
        error ? res.redirect("/blogs") : res.render("edit", {blog: foundBlog});
    });
});

app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (error, updatedBlog) => {
        error ? res.redirect("/blogs") : res.redirect("/blogs/" + req.params.id);
    });
});

app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (error) => {
        error ? res.redirect("/blogs") : res.redirect("/blogs");
    });
});

app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (error, newBlog) => {
        error ? res.render("new") :  res.redirect("/blogs");
    });
});

