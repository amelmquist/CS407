/**
 * Created by Steven on 3/3/2017.
 */

starter.controller('welcomePageController', function($scope, $state, $ionicViewSwitcher) {
  $scope.name = "";

  $scope.goToNext = function() {
    $scope.name = "";

    $ionicViewSwitcher.nextDirection('forward');
    $state.go('routingPage');
  };
});
