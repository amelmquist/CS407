/**
 * Created by Steven on 3/3/2017.
 */

starter.controller('welcomePageController', function($scope, $rootScope, $state, $ionicPlatform, $ionicViewSwitcher) {
  $scope.nameBox = "";

  $ionicPlatform.ready(function () {
    cordova.plugins.diagnostic.requestExternalStorageAuthorization(function (status) {
    }, function (error) {
      // $scope.perms = error;
    });
  });

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
