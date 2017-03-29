/**
 * Created by Steven on 3/5/2017.
 */

starter.factory('Room', function() {

  return function(hostUserObject, roomName, roomPassword) {
    this.hostName = hostUserObject.name;
    this.roomName = roomName;
    this.roomPassword = roomPassword;
    this.allUsersInRoom = {};
    this.allUsersInRoom[hostUserObject.name] = hostUserObject;
    // intelligent queue data structure
    this.queue = [];
    // Every time a room is created or modified, check if this bool var is true. If so, exit the room.
    // Currently, this is how we handle the case where the host deletes themselves from the room
    this.quitRoom = false;
    this.skipThreshold = 0;

    this.addUser = function(someUser) {

      // if user is already in this room
      if (this.allUsersInRoom[someUser.name] != null) {
        alert("User "+someUser.name+"has already joined this room!");
      }
      else {
        this.allUsersInRoom[someUser.name] = someUser;
      }

      };

    this.removeUser = function(someUser) {
      if (this.hostName === someUser.name) {
        this.quitRoom = true;
      }
      else {
        delete this.allUsersInRoom[someUser.name];
      }
    };

    this.addSong = function(newSong) {
      this.queue.push(newSong);
    };

    this.goToNextSong = function() {
      this.queue.shift();
    };

    this.updateSkipThreshold = function(newThreshold) {
      if (newThreshold >= 0 && newThreshold <= 100) {
        this.skipThreshold = newThreshold;
      }
      else {
        alert("Threshold provided was invalid!");
      }
    }

    //TODO: Need to change host to guest view and the new host to host view instantaneously
    /* this.changeHost = function(someUser) {
      var userId = someUser;
      if (this.allUsersInRoom[userId] != null) {
        this.hostId = userId;
      }
    };*/
  }
});

starter.controller('roomViewHostController', function(Room, $rootScope, $scope, $state, $stateParams, $ionicViewSwitcher) {
  $scope.roomName = $stateParams.room_name;
  $scope.password = $stateParams.password;
  $scope.hostName = $rootScope.currUser.name;

  //$scope.createRoom = function() {
  var room = new Room($rootScope.currUser, $scope.roomName, $scope.password);
  $scope.room = room;
  $scope.numUsers = Object.keys($scope.room.allUsersInRoom).length;

  console.log($rootScope);
  console.log($scope);

  if ($scope.room.quitRoom === true) {
    $scope.closeRoom();
  }

  $scope.closeRoom = function() {
    //Todo, make this function ask for confirmation before closing the room
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

  $scope.changeOptions = function() {
    $state.go('roomOptionsPage');
  };

  $scope.viewUsers = function() {
    $state.go('usersPage', {
      'room': $scope.room,
    });
  };

  var song;

  $scope.play = function(){
     var url = "file:///www/example.mp3";
    // var url = "http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3";
    // var url = "cdvfile://localhost/persistent/audio/hangouts_incoming_call.ogg"

    song = new Media(url,
      // success callback
      function () { $scope.debug = "playAudio():Audio Success"; },
      // error callback
      function (err) { $scope.debug = "playAudio():Audio Error: " + err; }
    );
    song.play();

    $scope.debug = "Playing music!";
  };

  $scope.pause = function(){
    song.pause();
    $scope.dubug = "Paused music!";
  };
});
