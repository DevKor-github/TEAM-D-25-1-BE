export interface CreateSearchRestaurantTagParams {
  restaurantId: string;
  name: string;
}

export interface CreateBulkSearchRestaurantTagParams {
  restaurantId: string;
  names: string[];
}
