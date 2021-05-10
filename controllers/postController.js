const Post = require('../models/Post');
const fs = require('fs');

exports.getAllPosts = async (req, res) => {

  const page = req.query.page || 1;
  const postPerPage = 3;

  const totalPosts = await Post.find().countDocuments();

  const posts = await Post.find({})
  .sort('-dateCreated')
  .skip((page-1) * postPerPage)
  .limit(postPerPage)

  res.render('index', {
    posts: posts,
    current: page,
    pages: Math.ceil(totalPosts / postPerPage)
  });
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('post', {
    post,
  });
};

exports.createPost = async (req, res) => {
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadePost = req.files.title;
  let uploadPath = __dirname + '/../public/uploads/' + uploadePost.name;

  uploadePost.mv(uploadPath, async () => {
    await Post.create({
      ...req.body,
      title: '/uploads/' + uploadePost.name,
    });
    res.redirect('/');
  });
};

exports.updatePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  post.title = req.body.title;
  post.detail = req.body.detail;
  post.save();

  res.redirect(`/posts/${req.params.id}`);
};

exports.deletePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  let deletedPost = __dirname + '/../public' + post.title;
  fs.unlinkSync(deletedPost);
  await Post.findByIdAndRemove(req.params.id);
  res.redirect('/');
};