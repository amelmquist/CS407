starter.controller('routingPageController', function($scope, $rootScope, $state, $ionicViewSwitcher, $firebaseArray) {

  $scope.$on('$ionicView.enter', function() {
    $scope.displayName = $rootScope.name;
  });

  var fburl = "https://jamfly-5effe.firebaseio.com/";
  $scope.loadingRooms = true;

  $scope.availableRooms = $firebaseArray(new Firebase(fburl).child("roomList"));

  $scope.numRooms = -1;
  $scope.availableRooms.$loaded().then(function() {
    $scope.numRooms = $scope.availableRooms.length;
    $scope.loadingRooms = false;
  });

  $scope.availableRooms.$watch(function() {
    $scope.numRooms = $scope.availableRooms.length;
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
