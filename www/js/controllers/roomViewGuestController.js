/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('roomViewGuestController', function($scope, $state) {

  $scope.leaveRoom = function() {
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('routingPage');
  };

});
