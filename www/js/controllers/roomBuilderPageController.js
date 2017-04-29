/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomBuilderPageController', function($scope, $state, $ionicViewSwitcher) {
  $scope.roomName = "";
  $scope.password = "";

  $scope.cancelAndGoBackToRouting = function() {
    $state.go('routingPage');
  };

  $scope.createRoom = function() {
    //TODO: ensure room name is unique then state.go

    $scope.tempName = $scope.roomName;
    $scope.tempPassword = $scope.password;
    // to clear text in roomBuilderPage
    $scope.roomName = "";
    $scope.password = "";

    $ionicViewSwitcher.nextDirection('forward');

    $state.go('roomViewHost', {
    'room_name': $scope.tempName,
    'password' : $scope.tempPassword
    });
  };
});
