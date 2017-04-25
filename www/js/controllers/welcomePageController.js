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
  $scope.password = "";
  $scope.listOfUsers = {};

  //TODO: load list of users from database

  $scope.validateExistingName = function() {
    // check if name and password match. If so, goToNext
    var id = $scope.name + $scope.password;
    if ($scope.listOfUsers[id] != null) {
        $rootScope.currUser = $scope.listOfUsers[id];
        $scope.goToNext();
    }
    else {
      alert("Username or password is incorrect!");
    }
  };

  $scope.validateNewName = function() {
    // check if name has already been used, if not, goToNext. Else, display error message
    var newName = true;

    for (var userId in $scope.listOfUsers) {
      var user = $scope.listOfUsers[userId];

      if (user.name === $scope.name) {
        newName = false;
      }
    }

    if (newName) {
      var id = $scope.name + $scope.password;
      var user = new User($scope.name, $scope.password);
      $rootScope.currUser = user;
      $scope.listOfUsers[id] = user;
      $scope.goToNext();
    }
    else {
      alert("Username already taken!");
    }
  };

  $scope.goToNext = function() {
    $scope.name = "";
    $scope.password = "";

    $ionicViewSwitcher.nextDirection('forward');
    $state.go('routingPage');
  };
});
