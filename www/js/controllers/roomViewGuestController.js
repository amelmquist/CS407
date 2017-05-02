/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomViewGuestController', function($scope, $rootScope, $state, $ionicLoading, $ionicViewSwitcher,
                                                       $stateParams, $ionicSideMenuDelegate, $firebaseObject, $firebaseArray) {
  var fburl = "https://jamfly-5effe.firebaseio.com/";
  var roomRef = new Firebase(fburl).child("roomList").child($stateParams.roomID);
  $scope.roomInfo = $firebaseObject(roomRef.child("roomData"));
  $scope.messages = $firebaseArray(roomRef.child("messages"));
  $scope.library = $firebaseArray(roomRef.child("library"));
  $scope.songQueue = $firebaseArray(roomRef.child("songQueue"));
  $scope.requestList = $firebaseArray(roomRef.child("requests"));

  $scope.roomInfo.$loaded().then(function() {
    $scope.roomInfo.numUsers++;
    $scope.roomInfo.$save();
  });

  $scope.roomInfo.$watch(function(event) {
    if($scope.roomInfo.roomName == null)
    {
      //Room was deleted by host
      $state.go('routingPage');
    }
  });

  $scope.userMessage = "";
  $scope.submitMessage = function()
  {
    $scope.messages.$add({"user": $rootScope.name, "message": $scope.userMessage});
    $scope.roomInfo.numMessages++;
    $scope.roomInfo.$save();
    $scope.userMessage = "";

  };

  $scope.leaveRoom = function() {
    $scope.roomInfo.$loaded().then(function() {
      $scope.roomInfo.numUsers--;
      $scope.roomInfo.$save();
    });
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

  $scope.requestSong = function(song) {
    $ionicLoading.show({ template: "Song Added!", noBackdrop: false, duration: 500 });
    $scope.requestList.$add(song);
  };

  // dealing with side menu
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

});
