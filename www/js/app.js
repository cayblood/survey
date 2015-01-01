// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('pages', {
    url: "/page/:pageId",
    templateUrl: function (stateParams) { return 'templates/' + stateParams.pageId + '.html'; },
    controller: "SurveyCtrl as ctl"
  });
  $urlRouterProvider.otherwise('/page/intro');
})
.run(function($rootScope, $ionicPlatform) {
  function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }
  $rootScope.songOrder = shuffle([null, 'slow', 'medium', 'fast']);
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
.controller('SurveyCtrl', function($location, $stateParams, $rootScope) {
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
      }
      return false;
    };

    self.next = function () {
      var pageId = $stateParams.pageId,
        index = self.order.indexOf(pageId),
        nextPageId = self.order[index + 1];
      if (self.songs[pageId]) {
        createjs.Sound.stop(self.songs[pageId]);
      }
      if (self.songs[nextPageId]) {
        createjs.Sound.play(self.songs[nextPageId], {loop: -1});
      }
      if (['one', 'two', 'three', 'four', 'thanks'].indexOf(nextPageId) !== -1) {
        self.timings.push(new Date().getTime() / 1000);
      }
      $location.path('/page/' + self.order[index + 1]);
    };
});
