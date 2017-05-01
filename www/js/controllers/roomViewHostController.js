/**
 * Created by Steven on 3/5/2017.
 */

/*
starter.factory('Room', function () {

  return function (hostUserObject, roomName, roomPassword) {
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

    this.addUser = function (someUser) {

      // if user is already in this room
      if (this.allUsersInRoom[someUser.name] != null) {
        alert("User " + someUser.name + "has already joined this room!");
      }
      else {
        this.allUsersInRoom[someUser.name] = someUser;
      }

    };

    this.removeUser = function (someUser) {
      if (this.hostName === someUser.name) {
        this.quitRoom = true;
      }
      else {
        delete this.allUsersInRoom[someUser.name];
      }
    };

    this.addSong = function (newSong) {
      this.queue.push(newSong);
    };

    this.goToNextSong = function () {
      this.queue.shift();
    };

    this.updateSkipThreshold = function (newThreshold) {
      if (newThreshold >= 0 && newThreshold <= 100) {
        this.skipThreshold = newThreshold;
      }
      else {
        alert("Threshold provided was invalid!");
      }
    }

    //TODO: Need to change host to guest view and the new host to host view instantaneously
     this.changeHost = function(someUser) {
     var userId = someUser;
     if (this.allUsersInRoom[userId] != null) {
     this.hostId = userId;
     }
     };
  }
});
*/
starter.factory('Room', function($firebaseArray, $firebaseObject) {

  var fb = {};

  var fburl = "https://jamfly-5effe.firebaseio.com/";

  fb.initialize = function(roomID)
  {
    fb.roomID = roomID;
    fb.roomRef = new Firebase(fburl).child("roomList").child(roomID);
    fb.messages = $firebaseArray(fb.roomRef.child("messages"));
    fb.roomData = $firebaseObject(fb.roomRef.child("roomData"));

    fb.delete = function()
    {
      fb.roomRef.remove();
    };

    return fb;

  };

  return fb;
});

starter.factory("$fileFactory", function ($q) {

  var File = function () {
  };
  File.prototype = {

    getParentDirectory: function (path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function (fileSystem) {
        fileSystem.getParent(function (result) {
          deferred.resolve(result);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntriesAtRoot: function () {
      var deferred = $q.defer();
      var homePath = cordova.file.externalRootDirectory;
      var homePath = homePath + "/Music";
      window.resolveLocalFileSystemURI(homePath, function (fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function (entries) {
          deferred.resolve(entries);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntries: function (path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function (fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function (entries) {
          deferred.resolve(entries);
        }, function (error) {
          deferred.reject(error);
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }
  };
  return File;

})

starter.controller('roomViewHostController', function (Room, $rootScope, $scope, $state, $stateParams,
                                                       $ionicViewSwitcher, $interval, Song, $fileFactory,
                                                       $ionicPlatform, $ionicSideMenuDelegate, $ionicPopup) {
  //room host control properties
  $scope.roomName = $stateParams.room_name;
  $scope.password = $stateParams.password;
  // $scope.hostName = $rootScope.currUser.name;
  var fb = Room.initialize($scope.roomName);
  $scope.messages = fb.messages;
  $scope.roomData = fb.roomData;

  $scope.roomData.$loaded().then(function() {
    //Only overwrite values if the room is brand new
    if($scope.roomData.roomName == null)
    {
      $scope.roomData.roomName = $scope.name + "'s Room";
      $scope.roomData.numMessages = 0;
      $scope.roomData.numUsers = "1";
      $scope.roomData.$save();
    }
  });

  $scope.addMessage = function() {

    $ionicPopup.prompt({
      title: 'New Message',
      template: 'Type your message below!'
    }).then(function(res) {
      $scope.messages.$add({
        "user": $rootScope.name,
        "message": res
      });
      $scope.roomData.numMessages++;
      $scope.roomData.$save();
    });
  };

  $scope.removeMessage = function(message) {
    $scope.messages.$remove(message);
    $scope.roomData.numMessages--;
    $scope.roomData.$save();
  };


  //$scope.createRoom = function() {
  // var room = new Room($rootScope.currUser, $scope.roomName, $scope.password);
  //var room = new Room("USER X", $scope.roomName, $scope.password);
  //$scope.room = room;
  //$scope.numUsers = Object.keys($scope.room.allUsersInRoom).length;

  //console.log($rootScope);
  //console.log($scope);

  //if ($scope.room.quitRoom == true) {
    //$scope.closeRoom();
  //}

  $scope.closeRoom = function () {
    var confirmed = $ionicPopup.confirm({
      title: 'Closing Room',
      template: 'Are you sure you want to close the room?'
    });

    confirmed.then(function(res) {
      if(res) {
        $ionicPopup.alert({
          title: 'Deleting Room'
        });
        $scope.endMusic();
        fb.roomRef.remove();
        $ionicViewSwitcher.nextDirection('back');
        $state.go('routingPage');
      }
    });
  };

  $scope.changeOptions = function () {
    $state.go('roomOptionsPage');
  };

  $scope.viewUsers = function () {
    $state.go('usersPage');
  };

  //music queue control mechanisms
  $scope.musicQueue = [];

  // $scope.timeRemaining;
  $scope.hasCurrentSong = false;

  $scope.songPlaying = false; //initially start with no song
  $scope.currentSong = "";

  $scope.updateQueue = function (status) {
    switch (status) {
      case 0: //MEDIA_NONE
        // $scope.debug = "MEDIA_NONE";
        break;
      case 1: //MEDIA_STARTING
        // $scope.debug = "MEDIA_STARTING";
        break;
      case 2: //MEDIA_RUNNING
        // $scope.debug = "MEDIA_RUNNING";
        break;
      case 3: //MEDIA_PAUSED
        // $scope.debug = "MEDIA_PAUSED";
        break;
      case 4: //MEDIA_STOPPED
        // $scope.debug = "MEDIA_STOPPED";
        $scope.currentSong.song.release();
        $scope.hasCurrentSong = false;
        $scope.play();
      default:
    }
  };

  $scope.play = function () {
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.play();
    } else if ($scope.musicQueue.length > 0) {
      var nextSong = new Media($scope.musicQueue[0].songPath,
        // success callback
        function () {
          $scope.debug = "created media";
        },
        // error callback
        function onError(err) {
          $scope.debug = "media error";
        },
        function onStatus(status) {
          $scope.$apply(function () {
            $scope.updateQueue(status);
            $scope.mediaStatus = "status: " + status;
          })
        }
      );
      $scope.currentSong = {
        "name": $scope.musicQueue[0].name,
        "songPath": $scope.musicQueue[0].songPath,
        "song": nextSong
      };
      $scope.musicQueue.shift();
      $scope.hasCurrentSong = true;
      $scope.currentSong.song.play();
      $scope.debug = $scope.currentSong.name;
    } else {
      $scope.currentSong = "";
    }
  };

  $scope.pause = function () {
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.pause();
    }
  };

  $scope.next = function () {
    if ($scope.hasCurrentSong) {
      // $scope.currentSong.song.pause();
      $scope.currentSong.song.release();
      // $scope.hasCurrentSong = false;
      $scope.debug = "removed current song";
    }
  };

  $scope.endMusic = function () {
    $scope.musicQueue = "";
    if ($scope.hasCurrentSong) {
      $scope.currentSong.song.release();
    }
  };

  $scope.songUp = function(argSong){
    var index = $scope.musicQueue.indexOf(argSong);
    if(index > 0){
      var temp = $scope.musicQueue[index-1];
      $scope.musicQueue[index-1] = $scope.musicQueue[index];
      $scope.musicQueue[index] = temp;
    }
  };
  $scope.songDown = function(argSong){
    var index = $scope.musicQueue.indexOf(argSong);
    if(index < $scope.musicQueue.length-1){
      var temp = $scope.musicQueue[index+1];
      $scope.musicQueue[index+1] = $scope.musicQueue[index];
      $scope.musicQueue[index] = temp;
    }
  };
  $scope.removeSong = function(argSong){
    var index = $scope.musicQueue.indexOf(argSong);
    $scope.musicQueue.splice(index,1);
  };

  //logic for file management
  $scope.musicLibrary = [];
  var fs = new $fileFactory();
  // $scope.debug = "location 1: Debug started";
  $ionicPlatform.ready(function () {
    // $scope.debug = "location 1.5";
    cordova.plugins.diagnostic.requestExternalStorageAuthorization(function (status) {
      // $scope.perms = "Authorization: " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied");
    }, function (error) {
      // $scope.perms = error;
    });

    //Get the root music directory - found in sdcard/Music (externalRootStorage()/Music)
    fs.getEntriesAtRoot().then(function (result) {
      $scope.files = result;
      $scope.getAllFiles($scope.files);
    }, function (error) {
      console.error(error);
    });

    //recursive function for going through entire music library
    $scope.getAllFiles = function (entries) {
      //for all entries in path, either add them to music library or add their contents
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isFile) {
          //it must be a file to get to this place: avoid directories with ".mp3"
          if (entries[i].name.includes('.mp3')) {
            // only add mp3 files
            var name = entries[i].name.split('.mp3')[0];
            var songPath = entries[i].nativeURL;
            // var foundSong = new Media(entries[i].nativeURL,
            //   // success callback
            //   function () {
            //     $scope.debug = "created media";
            //   },
            //   // error callback
            //   function onError(err) {
            //     $scope.debug = "media error";
            //   },
            //   function onStatus(status) {
            //     $scope.$apply(function () {
            //       $scope.updateQueue(status);
            //       $scope.mediaStatus = "status: " + status;
            //     })
            //   }
            // );
            $scope.musicLibrary.push({"name": name, "songPath": songPath});
          }
        }
        else {
          fs.getEntries(entries[i].nativeURL).then(function (result) {
            $scope.getAllFiles(result);
          });
        }
      }
    }
  });

  $scope.addSongtoQueue = function (songtoAdd) {
    $scope.musicQueue.push({"name": songtoAdd.name, "songPath": songtoAdd.songPath});
    songtoAdd.song.release();
  };

  // dealing with side menu
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

});

