// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var starter = angular.module('ionicApp', ['ionic', 'firebase']);


starter.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('welcomePage', {
      url: '/welcomeURL',
      templateUrl: 'templates/welcomePage.html',
      controller: 'welcomePageController'
    })
    .state('routingPage', {
      url: '/routingURL',
      templateUrl: 'templates/routingPage.html',
      controller: 'routingPageController'
    })
    .state('roomViewGuest', {
      url: '/roomViewGuestURL',
      params: {"roomID": null},
      templateUrl: 'templates/roomViewGuest.html',
      controller: 'roomViewGuestController'
    })
    .state('roomBuilderPage', {
      url: '/roomBuilderPageURL',
      templateUrl: 'templates/roomBuilderPage.html',
      controller: 'roomBuilderPageController'
    })
    .state('roomViewHost', {
      url: '/roomViewHostURL',
      templateUrl: 'templates/roomViewHost.html',
      controller: 'roomViewHostController',
      params: {room_name: null, password: null}
    })
    .state('roomOptionsPage', {
      url: '/roomOptionsPageURL',
      templateUrl: 'templates/roomOptionsPage.html',
      controller: 'roomOptionsPageController'
    })
    .state('usersPage', {
      url: '/usersPageURL',
      templateUrl: 'templates/usersPage.html',
      controller: 'usersPageController',
      params: {room: null}
    })
    .state('firstPage', {
      url: '/firstURL',
      templateUrl: 'templates/firstPage.html',
      controller: 'page1controller'
    })
    .state('secondPage', {
      url: '/secondURL',
      templateUrl: 'templates/secondPage.html',
      controller: 'page2controller'
    });
  $urlRouterProvider.otherwise("/welcomeURL");
});


//This function was auto-generated. I don't know what it does, it's possible we'll need it eventually
starter.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
