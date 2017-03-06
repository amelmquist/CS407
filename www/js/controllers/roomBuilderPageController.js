/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('roomBuilderPageController', function($scope, $state) {

  $scope.cancelAndGoBackToRouting = function() {
    $state.go('roomViewGuest');
  };

  $scope.createRoom = function() {
    $state.go('roomViewHost');
  };

});
