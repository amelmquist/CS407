/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomOptionsPageController', function($scope, $state, $ionicViewSwitcher) {

  $scope.cancelChanges = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('roomViewHost');
  };

  $scope.applyChanges = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('roomViewHost');
  };

});
