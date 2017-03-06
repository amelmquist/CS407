/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('roomViewHostController', function($scope, $state) {

  $scope.closeRoom = function() {
    //Todo, make this function ask for confirmation before closing the room
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('routingPage');
  };

  $scope.changeOptions = function() {
    $state.go('roomOptionsPage');
  };

});
