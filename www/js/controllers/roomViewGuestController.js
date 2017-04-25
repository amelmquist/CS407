/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomViewGuestController', function($rootScope, $scope, $state, $ionicViewSwitcher) {

  $scope.leaveRoom = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

});
