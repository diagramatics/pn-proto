(function() {
  'use strict';
  var app;

  app = angular.module('writePrototype', ['ui.router', 'textAngular', 'contenteditable', 'firebase', 'wu.masonry', 'ngSanitize']);

  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    return $stateProvider.state('main', {
      url: '/',
      templateUrl: 'partials/main.html',
      controller: 'MainController as mainCtrl'
    }).state('write', {
      url: '/write',
      templateUrl: 'partials/write.html',
      controller: 'WriteController as writeCtrl'
    }).state('writeProto', {
      url: '/write-proto',
      templateUrl: 'partials/write-proto.html',
      controller: 'WriteProtoController'
    }).state('post', {
      url: '/posts/{post:[0-9]{1,8}}',
      templateUrl: 'partials/post.html',
      controller: 'PostController as postCtrl'
    });
  });

  app.controller('MainController', [
    '$scope', function($scope) {
      var postsRef, scope;
      scope = this;
      postsRef = new Firebase("https://boiling-torch-577.firebaseio.com/posts/");
      this.posts = {};
      return postsRef.once('value', function(data) {
        scope.posts = data.val();
        return $scope.$apply();
      });
    }
  ]);

  app.controller('PostController', [
    '$scope', '$stateParams', function($scope, $stateParams) {
      var postRef, scope;
      scope = this;
      postRef = new Firebase("https://boiling-torch-577.firebaseio.com/posts/post_" + $stateParams.post);
      this.post = {};
      return postRef.once('value', function(data) {
        scope.post = data.val();
        console.log(scope.post);
        return $scope.$apply();
      });
    }
  ]);

  app.controller('WriteController', [
    '$scope', '$state', '$timeout', function($scope, $state, $timeout) {
      this.submit = 0;
      this.postData = function() {
        var configRef, postCount, postsRef, scope;
        postCount = 0;
        if (!this.title) {
          this.title = "An untitled post";
        }
        scope = this;
        scope.submit = 1;
        postsRef = new Firebase("https://boiling-torch-577.firebaseio.com/posts/");
        configRef = new Firebase("https://boiling-torch-577.firebaseio.com/config");
        return configRef.once('value', function(data) {
          postCount = data.val().postCount + 1;
          return postsRef.child('post_' + postCount).set({
            title: scope.title,
            content: scope.editor,
            url: postCount
          }, function(err) {
            if (!err) {
              configRef.child('postCount').transaction(function(currentValue) {
                return currentValue + 1;
              });
              scope.submit = 2;
              scope.postNumber = postCount;
              $scope.$apply();
              return $timeout(function() {
                return $state.go('post', {
                  post: postCount
                });
              }, 3000);
            }
          });
        });
      };
    }
  ]);

  app.controller('WriteProtoController', function() {
    var editor;
    return editor = {};
  });

}).call(this);

(function() {
  'use strict';
  angular.module('writePrototype').directive('editorPlaceholder', [
    '$interval', '$animate', function($interval, $animate) {
      return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
          var timer, _changeText;
          scope.text = ['Write things here', 'Write stuff here', 'Write write write'];
          _changeText = function() {
            element.text(scope.text[0]);
            return scope.text.push(scope.text.shift());
          };
          _changeText();
          return timer = $interval(_changeText, 7500);
        }
      };
    }
  ]).directive('editorMain', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var _focus;
        _focus = function() {
          return element.addClass('focused');
        };
        element.attr('contenteditable', true);
        return element.on('focus', _focus);
      }
    };
  });

}).call(this);
