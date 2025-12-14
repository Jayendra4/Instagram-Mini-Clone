const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

const validatePostInput = (req, res, next) => {
  const { imageUrl, caption } = req.body;
  const errors = {};

  if (!imageUrl || !imageUrl.trim()) {
    errors.imageUrl = 'Image URL is required';
  } else {
    const trimmedUrl = imageUrl.trim();
    
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      errors.imageUrl = 'URL must start with http:// or https://';
    } else {
      try {
        new URL(trimmedUrl);
      } catch (urlError) {
        errors.imageUrl = 'Please provide a valid URL format';
      }
    }
  }

  if (caption && caption.length > 2200) {
    errors.caption = 'Caption cannot exceed 2200 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      success: false,
      errors 
    });
  }

  next();
};

router.post('/', authMiddleware, validatePostInput, async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;
    const userId = req.user._id;

    const post = new Post({
      user: userId,
      imageUrl,
      caption: caption || ''
    });

    await post.save();
    await post.populate('user', 'username profilePicture');

    res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get feed (posts from followed users)
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('following');
    
    const followingIds = [...user.following, userId]; // Include own posts in feed

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profilePicture')
        .populate({
          path: 'comments.user',
          select: 'username profilePicture'
        })
        .lean(),
      Post.countDocuments({ user: { $in: followingIds } })
    ]);

    const hasMore = page * limit < total;

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });

  } catch (error) {
    console.error('Feed fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed'
    });
  }
});

// Get posts by user ID
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profilePicture')
        .populate({
          path: 'comments.user',
          select: 'username profilePicture'
        })
        .lean(),
      Post.countDocuments({ user: userId })
    ]);

    const hasMore = page * limit < total;

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });

  } catch (error) {
    console.error('User posts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    });
  }
});

// Get single post by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments.user',
        select: 'username profilePicture'
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

// Like a post
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Unlike a post
router.put('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Comment cannot be empty' 
      });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user._id,
            text: text.trim(),
            createdAt: new Date()
          },
        },
      },
      { new: true }
    )
    .populate('user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get the last comment (the one just added)
    const newComment = post.comments[post.comments.length - 1];

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        newComment: newComment
      }
    });
  } catch (error) {
    console.error('Error commenting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Ensure the deleter is the owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();

    return res.json({ message: 'Post removed' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;