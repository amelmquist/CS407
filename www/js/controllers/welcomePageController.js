/**
 * Created by Steven on 3/3/2017.
 */

starter.controller('welcomePageController', function($scope, $rootScope, $state, $ionicViewSwitcher) {
  $scope.nameBox = "";

  $scope.goToNext = function() {
    if($scope.nameBox == "")
    {
      $rootScope.name = "Guest";
    }
    else
    {
      $rootScope.name = $scope.nameBox;
    }
    $scope.nameBox = "";

    $ionicViewSwitcher.nextDirection('forward');
    $state.go('routingPage');
  };
});
