/**
 * Created by Steven on 3/5/2017.
 */

starter.controller('roomViewGuestController', function($scope, $rootScope, $state, $ionicLoading, $ionicPopup, $ionicViewSwitcher,
                                                       $stateParams, $ionicSideMenuDelegate, $firebaseObject, $firebaseArray) {
  var fburl = "https://jamfly-5effe.firebaseio.com/";
  var roomRef = new Firebase(fburl).child("roomList").child($stateParams.roomID);
  $scope.roomInfo = $firebaseObject(roomRef.child("roomData"));
  $scope.library = $firebaseArray(roomRef.child("library"));
  $scope.songQueue = $firebaseArray(roomRef.child("songQueue"));
  $scope.requestList = $firebaseArray(roomRef.child("requests"));
  $scope.usersList = $firebaseArray(roomRef.child("usersList"));

  $scope.roomInfo.$loaded().then(function() {
    $scope.roomInfo.numUsers++;
    $scope.roomInfo.$save();
  });

  $scope.roomInfo.$watch(function(event) {
    if($scope.roomInfo.roomName == null)
    {
      //Room was deleted by host
      $state.go('routingPage');
    }
  });

  $scope.librarySize = -1;
  $scope.library.$loaded().then(function() {
    $scope.librarySize = $scope.library.length;
  });
  $scope.library.$watch(function() {
    $scope.librarySize = $scope.library.length;
  });

  var userListKey = "";
  $scope.usersList.$loaded().then(function() {
    $scope.usersList.$add({"name": $rootScope.name, "hostBool": false}).then(function(ref) {
      userListKey = ref.key();
    });
  });

  $scope.showUserList = function(){
    $ionicPopup.show({
      template: '<ion-list>                                '+
                '  <ion-item ng-repeat="user in usersList"> '+
                '    {{user.name}}  <span ng-show="user.hostBool">[Host]</span>'+
                '  </ion-item>                             '+
                '</ion-list>                               ',
      title: 'List',
      scope: $scope,
      buttons: [
        { text: 'Close' },
      ]
    });
  };

  $scope.leaveRoom = function() {
    $scope.usersList.$remove($scope.usersList.$getRecord(userListKey));
    $scope.roomInfo.$loaded().then(function() {
      $scope.roomInfo.numUsers--;
      $scope.roomInfo.$save();
    });

    //Free up all references
    $scope.roomInfo.$destroy();
    $scope.library.$destroy();
    $scope.songQueue.$destroy();
    $scope.requestList.$destroy();
    $scope.usersList.$destroy();

    $ionicViewSwitcher.nextDirection('back');
    $state.go('routingPage');
  };

  $scope.requestSong = function(song) {
    $ionicLoading.show({ template: "Song Added!", noBackdrop: false, duration: 500 });
    $scope.requestList.$add(song);
  };

  // dealing with side menu
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

});
