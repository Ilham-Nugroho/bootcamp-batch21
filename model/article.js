const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  author: {
    type: String,
  },
  title : {
    type: String,
    required: true
  },
  category : {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  content : {
    type: String,
    required: true

  },
  coverImage : {
    type: Buffer,
    required: true
  },

  coverImageType: {
    type: String,
    required: true
  },

  publishDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },

});

articleSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
         return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
     }

})


module.exports = mongoose.model('Article', articleSchema);
