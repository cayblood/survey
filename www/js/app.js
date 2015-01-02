// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

function loadSounds() {
  var loopFunc = function () {
    this.currentTime = 0;
    this.play();
  };
  window.testSound = new Audio("sounds/test.mp3");
  window.testSound.preload = 'auto';
  window.testSound.addEventListener('ended', loopFunc, false);
  window.slowSound = new Audio("sounds/slow.mp3");
  window.slowSound.preload = 'auto';
  window.slowSound.addEventListener('ended', loopFunc, false);
  window.mediumSound = new Audio("sounds/medium.mp3");
  window.mediumSound.preload = 'auto';
  window.mediumSound.addEventListener('ended', loopFunc, false);
  window.fastSound = new Audio("sounds/fast.mp3");
  window.fastSound.preload = 'auto';
  window.fastSound.addEventListener('ended', loopFunc, false);
}

angular.module('starter', ['ionic'])
.factory('storageService', function () {
  var formData = {};

  return {
    getData: function () {
      return formData;
    },
    setData: function (newFormData) {
      formData = newFormData
    },
    resetData: function () {
      formData = {};
    }
  };
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('pages', {
    url: "/page/:pageId",
    templateUrl: function (stateParams) { return 'templates/' + stateParams.pageId + '.html'; },
    controller: "SurveyCtrl as ctl"
  });
  $urlRouterProvider.otherwise('/page/intro');
})
.run(function($rootScope, $ionicPlatform) {
  loadSounds();
  function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }
  $rootScope.songOrder = shuffle([0, 'slow', 'medium', 'fast']);
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.controller('SurveyCtrl', function($location, $stateParams, $rootScope, $scope, storageService) {
    var self = this;
    self.order = ['intro', 'soundCheck', 'one', 'two', 'three', 'four', 'thanks'];
    self.songs = {
      intro: null,
      soundCheck: 'test',
      one: $rootScope.songOrder[0],
      two: $rootScope.songOrder[1],
      three: $rootScope.songOrder[2],
      four: $rootScope.songOrder[3],
      thanks: null
    };
    self.timings = [];
    self.timesClicked = 0;
    self.timesToClick = 24;

    self.incrementTimesClicked = function () {
      if (self.timesClicked < self.timesToClick) {
        self.timesClicked += 1;
      }
    };

    self.canContinue = function () {
      if ($stateParams.pageId === 'one') {
        if (self.formOne.$valid && self.timesClicked === self.timesToClick) {
          return true;
        }
      } else if (['two', 'three', 'four'].indexOf($stateParams.pageId) !== -1) {
        var pageName = $stateParams.pageId.charAt(0).toUpperCase() + $stateParams.pageId.slice(1);
        if (self['form' + pageName].$valid) {
          return true;
        }
      }
      return false;
    };

    //$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    //  var index = self.order.indexOf(toParams.pageId), previousPageId;
    //  if (toParams.pageId === 'intro') {
    //    storageService.resetData();
    //  }
    //  if (index > 0) {
    //    previousPageId = self.order[index - 1];
    //  }
    //  if (previousPageId && self.songs[previousPageId]) {
    //    window[self.songs[previousPageId] + 'Sound'].pause();
    //  }
    //  if (self.songs[toParams.pageId]) {
    //    window[self.songs[toParams.pageId] + 'Sound'].play();
    //  }
    //});

    self.submitData = function () {
      var resultsRef = new Firebase('https://james-survey.firebaseio.com/results'),
        attributes = {}, currentData = storageService.getData();
      attributes = {
        createdAt: Firebase.ServerValue.TIMESTAMP,
        oneElapsedTime: currentData.timings[1] - currentData.timings[0],
        twoElapsedTime: currentData.timings[2] - currentData.timings[1],
        threeElapsedTime: currentData.timings[3] - currentData.timings[2],
        fourElapsedTime: currentData.timings[4] - currentData.timings[3],
        songOrder: $rootScope.songOrder
      };
      for (var attrname in currentData) { attributes[attrname] = currentData[attrname]; }
      resultsRef.push(attributes);
    };

    self.next = function () {
      var pageId = $stateParams.pageId,
        index = self.order.indexOf(pageId),
        nextPageId = self.order[index + 1],
        currentData = storageService.getData();

      window.testSound.pause();
      window.slowSound.pause();
      window.mediumSound.pause();
      window.fastSound.pause();

      if (self.songs[nextPageId]) {
        window[self.songs[nextPageId] + 'Sound'].play();
      }

      if (['one', 'two', 'three', 'four', 'thanks'].indexOf(nextPageId) !== -1) {
        if (currentData.timings === undefined) {
          currentData.timings = [];
        }
        currentData.timings.push(new Date().getTime() / 1000);
      }
      if (['one', 'two', 'three', 'four'].indexOf(pageId) !== -1) {
        ['Sentence', 'Drawing', 'Math', 'Choice', 'Word'].forEach(function (item) {
          currentData[pageId + item] = self[pageId + item];
        });
      }
      storageService.setData(currentData);
      if (nextPageId === 'thanks') {
        self.submitData();
      }
      $location.path('/page/' + self.order[index + 1]);
    };
});
