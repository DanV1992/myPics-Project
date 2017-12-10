var express = require('express'),
router = express.Router(),
logger = require('../../config/logger'),
mongoose = require('mongoose'),
ToDo = mongoose.model('ToDo');
multer = require('multer'),
mkdirp = require('mkdirp');


module.exports = function (app, config) {
app.use('/api', router);


router.route('/todos').get(function (req, res, next) {
    logger.log('Get ToDo', 'verbose');
    var query = ToDo.find()
        .sort(req.query.order)
        .exec()
        .then(result => {
            if (result && result.length) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'No todos' });
            }
        })
        .catch(err => {
            return next(err);
        });
});


router.route('/todos/:todoId').get(function (req, res, next) {
    logger.log('Get todo ' + req.params.todoId, 'verbose');

    ToDo.findById(req.params.todoId)
        .then(todo => {
            if (todo) {
                res.status(200).json(todo);
            } else {
                res.status(404).json({ message: "No todo found" });
            }
        })
        .catch(error => {
            return next(error);
        });
});



router.route('/todos').post(function (req, res, next) {
    logger.log('Create ToDo', 'verbose');
    var todo = new ToDo(req.body);
    todo.save()
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            return next(err);
        });
});




router.route('/todos/:todoId').put(function (req, res, next) {
    logger.log('Update todo ' + req.params.todoId, 'verbose');

    ToDo.findOneAndUpdate({ _id: req.params.todoId }, req.body, { new: true, multi: false })
        .then(todo => {
            res.status(200).json(todo);
        })
        .catch(error => {
            return next(error);
        });
});




router.route('/todos/:todoId').delete(function (req, res, next) {
    logger.log('Delete todo ' + req.params.todoId, 'verbose');

    ToDo.remove({ _id: req.params.todoId })
        .then(todo => {
            res.status(200).json({ msg: "ToDo Deleted" });
        })
        .catch(error => {
            return next(error);
        });


    }); 

    router.route('/todos/user/:userId').get(function (req, res, next) {
        logger.log('Get all todos', 'verbose');

        var query = ToDo.find({ userId: req.params.userId })
            .sort(req.query.order)
            .exec()
            .then(result => {
                console.log(result)
                if (result && result.length) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).json({ message: 'No todos' })
                }
            })
            .catch(err => {
                return next(err);
            });
    });

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {      
              var path = config.uploads + req.params.userId + "/";
            mkdirp(path, function(err) {
                if(err){
                    res.status(500).json(err);
                } else {
                    cb(null, path);
                }
            });
        },
        filename: function (req, file, cb) {
            let fileName = file.originalname.split('.');   
            cb(null, fileName[0] + new Date().getTime() + "." + fileName[fileName.length - 1]);
        }
      });

      var upload = multer({ storage: storage });
      router.post('/todos/upload/:userId/:todoId', upload.any(), function(req, res, next){
          logger.log('Upload file for todo ' + req.params.todoId + ' and ' + req.params.userId, 'verbose');
          
          ToDo.findById(req.params.todoId, function(err, todo){
              if(err){ 
                  return next(err);
              } else {   
           
              console.log(req.files[0]); 

                  if(req.files){
                      todo.file = {
                          filename :  req.files[0].filename,
                          originalName : req.files[0].originalname,
                          dateUploaded : new Date()
                      };
                  }           
                  todo.save()
                      .then(todo => {
                          res.status(200).json(todo);
                      })
                      .catch(error => {
                          return next(error);
                      });
              }
          });
      });
      
    
};