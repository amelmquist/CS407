/**
 * Created by Steven on 3/3/2017.
 */
starter.factory('User', function() {

  return function(name, password) {
    this.name = name;
    this.password = password;
    this.queue = [];
    this.numSubmissions = 0;

    this.changePassword = function() {
    };

    this.addSong = function(newSong) {
      this.queue.push(newSong);
      this.numSubmissions++;
    };

    this.removeSong = function(song) {
      var songFound = false;

      for (var i = 0; i < queue.length; i++) {
        if (queue[i] === song) {
          //TODO: remove this song
          songFound = true;
        }
      }

      if (songFound) {
        this.numSubmissions--;
      }
    };
  }
});

starter.controller('welcomePageController', function(User, $rootScope, $scope, $state, $ionicViewSwitcher) {
  $scope.name = "";

  $scope.goToNext = function() {

    $ionicViewSwitcher.nextDirection('forward');
    $state.go('routingPage');
  };
});
