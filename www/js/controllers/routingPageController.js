starter.controller('routingPageController', function($scope, $state, $ionicViewSwitcher, $firebaseArray) {

  var fburl = "https://jamfly-5effe.firebaseio.com/";
  $scope.loadingRooms = true;

  $scope.availableRooms = $firebaseArray(new Firebase(fburl).child("roomList"));
  $scope.availableRooms.$loaded().then(function() {
    $scope.loadingRooms = false;
  });


  $scope.joinRoom = function(firebaseLink) {
    $state.go('roomViewGuest', {'roomID': firebaseLink.$id});
  };

  $scope.createRoom = function() {
    $state.go('roomBuilderPage');
  };

  $scope.exitToWelcomePage = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('welcomePage');
  }

});
