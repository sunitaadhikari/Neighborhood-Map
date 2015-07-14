function FavoritePlace(name, address){
    var self = this;
    self.name = name;
    self.address = address;
    self.details = ko.computed(function(){
        return name + " Street View Image";
    });

    /** We will include this as an image src attribute on the HTML file. Base StreetView URL is appended with the latitude and longitude from the model
     when used as an image src attribute, this will render the google street view image for the selected location on screen. **/
    self.streetViewUrl = ko.computed(function(){
        return "http://maps.googleapis.com/maps/api/streetview?size=600x400&location="+self.address.lattitude+","+self.address.longitude;
    });

    /** Each of our favorite places maintains its own mapMaker. It will be easier to filter out the map marker as we are filtering out the list, when defined here. **/
    self.mapMarker = ko.computed(function(){
        return new google.maps.Marker({
            position: new google.maps.LatLng(self.address.lattitude, self.address.longitude),
            animation: google.maps.Animation.DROP,
            title: self.name
        });
    });
}

function FavoritePlacesViewModel(){
    var self = this;

    self.mapInfoWindow = new google.maps.InfoWindow();

    /** Initializing google map **/
    self.init = function(){
        for(var i = 0; i < self.places().length; i++){
            google.maps.event.addListener(self.places()[i].mapMarker(), 'click', (function(place){
                return function() {
                    self.currentPlace(place);
                    self.mapInfoWindow.setContent(place.name);
                    self.mapInfoWindow.open(self.map, place.mapMarker());
                }
            })(self.places()[i]));
        }

        google.maps.event.addDomListener(window, 'load', self.init);
    };

    self.placeNameFilter = ko.observable('');

    self.places = ko.observableArray([]);

    myFavoritePlaces.forEach(function(place){
        self.places.push(new FavoritePlace(place.name, place.address));
    });

    self.currentPlace = ko.observable(self.places()[0]);

    self.map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {
            lat: self.currentPlace().address.lattitude,
            lng: self.currentPlace().address.longitude
        }
    });

    /** As the user starts typing in a specific place in the filter textfield, we will start filtering both the list view as well as the markers on the map. **/
    self.filteredPlaceNameArray = ko.computed(function(){
        var filteredArray = ko.utils.arrayFilter(self.places(), function(rec){
            return (
                (self.placeNameFilter().length == 0 || rec.name.toLowerCase().indexOf(self.placeNameFilter().toLowerCase()) > -1)
             )
        });

        /** Hiding all the map markers from the original list of places **/
        for(var i=0; i<self.places().length; i++){
            self.places()[i].mapMarker().setMap(null);
        }

        /** Displaying the marker in the filtered list **/
        filteredArray.forEach(function(place){
            place.mapMarker().setMap(self.map);
        });

        return filteredArray;
    });

    self.setPlace = function(){
        /** this function is called when user clicks on the list of places. In addition to updating the currentPlace observable, it will also display the place name over the pin and center it towards the screen. **/
        self.currentPlace(this);
        self.mapInfoWindow.setContent(this.name);
        self.mapInfoWindow.open(self.map, this.mapMarker());
        self.map.setCenter(new google.maps.LatLng(this.address.lattitude, this.address.longitude));
    };
}

/** Data containing all the favorite places that I would like to visit in NYC. **/
var myFavoritePlaces = [
    {
        name: "Empire State Building",
        address: {
            lattitude: 40.7484404,
            longitude: -73.9856554
        }
    },
    {
        name: "Statue of Liberty",
        address:{
            lattitude: 40.6892289,
            longitude: -74.044466
        }
    },
    {
        name: "Rockefeller Center",
        address : {
            lattitude: 40.7588923,
            longitude: -73.979067
        }
    },
    {
        name: "American Museum of Natural History",
        address: {
            lattitude: 40.7813599,
            longitude: -73.9740794
        }
    },
    {
        name: "Central Park",
        address: {
            lattitude: 40.7825524,
            longitude: -73.9654877
        }
    }
];


var viewModel = new FavoritePlacesViewModel();
ko.applyBindings(viewModel);
viewModel.init();
