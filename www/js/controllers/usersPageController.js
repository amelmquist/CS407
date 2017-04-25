/**
 * Created by damon on 3/28/2017.
 */
starter.controller('usersPageController', function($scope, $state, $stateParams, $ionicViewSwitcher) {
  $scope.room = $stateParams.room;

  console.log($scope);

  $scope.exitToRoomBuilder = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('roomViewHost', {
      'room_name': $scope.room.roomName,
      'password' : $scope.room.roomPassword
    });
  }

});
