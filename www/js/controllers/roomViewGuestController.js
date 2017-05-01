/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomViewGuestController', function($scope, $rootScope, $state, $ionicViewSwitcher,
                                                       $stateParams, $firebaseObject, $firebaseArray) {
  var fburl = "https://jamfly-5effe.firebaseio.com/";
  var roomRef = new Firebase(fburl).child("roomList").child($stateParams.roomID);
  $scope.roomInfo = $firebaseObject(roomRef.child("roomData"));
  $scope.messages = $firebaseArray(roomRef.child("messages"));

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
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

});
