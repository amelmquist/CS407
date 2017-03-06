/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('routingPageController', function($scope, $state) {

  $scope.joinRoom = function() {
    $state.go('roomViewGuest');
  };

  $scope.createRoom = function() {
    $state.go('roomBuilderPage');
  };

  $scope.exitToWelcomePage = function() {
    $state.go('welcomePage');
  }

});
