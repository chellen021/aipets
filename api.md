# MiniPet API (Version: 1.0.0)
API documentation for the MiniPet virtual pet game backend. This documentation is generated from JSDoc comments in the source code.
## Servers
- **Development server**: `http://localhost:3000/api/v1`

## Authentication
### bearerAuth (http)
- **Scheme**: `bearer`
- **Format**: `JWT`
- **Description**: JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"

## API Endpoints
### `POST` /auth/wechat_login
**Summary**: WeChat login or register
**Tags**: Auth
**Request Body**:
- Content-Type: `application/json`
  Schema: [WeChatLoginRequest](#schema-wechatloginrequest)
**Responses**:
- **`200`**: Successfully logged in or registered.
  - Content-Type: `application/json`
    Schema: [AuthResponse](#schema-authresponse)
- **`400`**: Invalid request (e.g., missing code).
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /auth/check_session
**Summary**: Check if user session is valid
**Tags**: Auth
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: Session is valid.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `user` | [User](#schema-user) |  | No |
- **`401`**: Unauthorized, token is missing or invalid.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /checkin/status
**Summary**: Get user's check-in status
**Tags**: Checkin
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: Check-in status retrieved successfully.
  - Content-Type: `application/json`
    Schema: [CheckinStatusResponse](#schema-checkinstatusresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /checkin
**Summary**: Perform daily check-in
**Tags**: Checkin
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: Check-in successful.
  - Content-Type: `application/json`
    Schema: [CheckinResponse](#schema-checkinresponse)
- **`400`**: Already checked in today or other error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /checkin/retroactive
**Summary**: Perform a retroactive check-in
**Tags**: Checkin
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Schema: [RetroactiveCheckinRequest](#schema-retroactivecheckinrequest)
**Responses**:
- **`200`**: Retroactive check-in successful.
  - Content-Type: `application/json`
    Schema: [CheckinResponse](#schema-checkinresponse)
- **`400`**: Invalid date, already checked in for this date, or retroactive check-in not allowed/failed.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /pets/{pet_id}/interact
**Summary**: Interact with a specific pet
**Tags**: Interaction
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `pet_id` | path | Yes | string | The ID of the pet to interact with. |
**Request Body**:
- Content-Type: `application/json`
  Schema: [InteractionRequest](#schema-interactionrequest)
**Responses**:
- **`200`**: Interaction successful.
  - Content-Type: `application/json`
    Schema: [InteractionResponse](#schema-interactionresponse)
- **`400`**: Invalid interaction type or details.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`404`**: Pet not found.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /pets/{pet_id}/interact/logs
**Summary**: Get interaction logs for a specific pet
**Tags**: Interaction
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `pet_id` | path | Yes | string | The ID of the pet whose interaction logs are to be retrieved. |
| `limit` | query | No | integer | Maximum number of logs to return. |
| `page` | query | No | integer | Page number for pagination. |
**Responses**:
- **`200`**: A list of interaction logs for the pet.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `logs` | array of [InteractionLog](#schema-interactionlog) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`404`**: Pet not found.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /leaderboards/main
**Summary**: Get main leaderboard (e.g., by user total points)
**Tags**: Leaderboard
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `limit` | query | No | integer | Number of top entries to return. |
| `page` | query | No | integer | Page number for pagination. |
| `criteria` | query | No | string | Criteria for the main leaderboard. |
**Responses**:
- **`200`**: A list of leaderboard entries.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `leaderboard` | array of [LeaderboardEntry](#schema-leaderboardentry) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /leaderboards/pet/{pet_type_id}
**Summary**: Get leaderboard for a specific pet type (e.g., by happiness or level)
**Tags**: Leaderboard
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `pet_type_id` | path | Yes | string | The ID or slug of the pet type (e.g., 'dragon', 'cat'). |
| `limit` | query | No | integer | Number of top entries to return. |
| `page` | query | No | integer | Page number for pagination. |
| `criteria` | query | No | string | Criteria for the pet type leaderboard. |
**Responses**:
- **`200`**: A list of pet leaderboard entries for the specified type.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `leaderboard` | array of [LeaderboardEntry](#schema-leaderboardentry) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
    | `pet_type_id` | string |  | No |
- **`404`**: Pet type not found or no leaderboard available.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /leaderboards/my-rank/{leaderboard_type}
**Summary**: Get current user's rank in a specific leaderboard
**Tags**: Leaderboard
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `leaderboard_type` | path | Yes | string | The type of leaderboard to check rank for (e.g., 'main_total_points', 'pet_dragon_level'). |
**Responses**:
- **`200`**: User's rank details.
  - Content-Type: `application/json`
    Schema: [UserRank](#schema-userrank)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`404`**: Leaderboard type not found or user not ranked.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /mall/products
**Summary**: Get list of products
**Tags**: Mall
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number for pagination. |
| `limit` | query | No | integer | Maximum number of products per page. |
| `product_type` | query | No | string | Filter by product type. |
| `sortBy` | query | No | string | Field to sort by. |
| `sortOrder` | query | No | string | Sort order. |
**Responses**:
- **`200`**: A list of products.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `products` | array of [Product](#schema-product) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /mall/products/{product_id}
**Summary**: Get details of a specific product
**Tags**: Mall
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `product_id` | path | Yes | string | The ID of the product to retrieve. |
**Responses**:
- **`200`**: Product details.
  - Content-Type: `application/json`
    Schema: [Product](#schema-product)
- **`404`**: Product not found.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /mall/orders
**Summary**: Create an order to purchase a product
**Tags**: Mall
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Schema: [CreateOrderRequest](#schema-createorderrequest)
**Responses**:
- **`201`**: Order created successfully.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `message` | string |  | No |
    | `order` | [Order](#schema-order) |  | No |
    | `userInventoryItem` | [UserInventoryItem](#schema-userinventoryitem) |  | No |
- **`400`**: Invalid request (e.g., product not found, insufficient stock, insufficient points).
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error (e.g., transaction failed).
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /mall/orders/my_orders
**Summary**: Get current user's order history
**Tags**: Mall
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number for pagination. |
| `limit` | query | No | integer | Maximum number of orders per page. |
| `status` | query | No | string | Filter orders by status. |
**Responses**:
- **`200`**: A list of the user's orders.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `orders` | array of [Order](#schema-order) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /mall/inventory/my_inventory
**Summary**: Get current user's virtual item inventory
**Tags**: Mall
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number for pagination. |
| `limit` | query | No | integer | Maximum number of inventory items per page. |
| `product_type` | query | No | string | Filter inventory by product type. |
**Responses**:
- **`200`**: A list of the user's inventory items.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `inventory` | array of [UserInventoryItem](#schema-userinventoryitem) |  | No |
    | `totalPages` | integer |  | No |
    | `currentPage` | integer |  | No |
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /api/v1/notifications/subscribe
**Summary**: Request permission for subscription messages (simulated)
**Tags**: Notifications
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Properties:
  | Name | Type | Description | Required |
  |------|------|-------------|----------|
  | `templateIds` | array of string | Array of template IDs the user is subscribing to. | No |
**Responses**:
- **`200`**: Subscription permission request acknowledged.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `success` | boolean |  | No |
    | `message` | string |  | No |
- **`401`**: 
- **`500`**: 

---
### `GET` /api/v1/notifications/settings
**Summary**: Get user's notification settings (simulated)
**Tags**: Notifications
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: Successfully retrieved notification settings.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `success` | boolean |  | No |
    | `data` | object |  | No |
- **`401`**: 
- **`500`**: 

---
### `POST` /pets/upload_photo
**Summary**: Upload a photo for pet generation (mock)
**Tags**: Pet
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Schema: [PetUploadPhotoRequest](#schema-petuploadphotorequest)
**Responses**:
- **`200`**: Photo uploaded successfully (mock).
  - Content-Type: `application/json`
    Schema: [PetUploadPhotoResponse](#schema-petuploadphotoresponse)
- **`400`**: Invalid request.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /pets/generate
**Summary**: Generate a pet based on photo/parameters (mock AI)
**Tags**: Pet
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Schema: [PetGenerateRequest](#schema-petgeneraterequest)
**Responses**:
- **`200`**: Pet generation options provided (mock).
  - Content-Type: `application/json`
    Schema: [PetGenerateResponse](#schema-petgenerateresponse)
- **`400`**: Invalid request.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /pets
**Summary**: Confirm and adopt a new pet
**Tags**: Pet
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Schema: [PetAdoptRequest](#schema-petadoptrequest)
**Responses**:
- **`201`**: Pet adopted successfully.
  - Content-Type: `application/json`
    Schema: [Pet](#schema-pet)
- **`400`**: Invalid request (e.g., invalid temp_pet_id, name missing).
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /pets/my_pets
**Summary**: Get all pets for the current user
**Tags**: Pet
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: A list of the user's pets.
  - Content-Type: `application/json`
    Array of items:
      Schema: [Pet](#schema-pet)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /pets/{pet_id}
**Summary**: Get details for a specific pet
**Tags**: Pet
**Security**:
- `bearerAuth` (No scopes)
**Parameters**:
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `pet_id` | path | Yes | string | The ID of the pet to retrieve. |
**Responses**:
- **`200`**: Details of the specified pet.
  - Content-Type: `application/json`
    Schema: [Pet](#schema-pet)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`404`**: Pet not found.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /users/profile
**Summary**: Get current user's profile
**Tags**: User
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: User profile retrieved successfully.
  - Content-Type: `application/json`
    Schema: [User](#schema-user)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `PUT` /users/profile
**Summary**: Update current user's profile
**Tags**: User
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Properties:
  | Name | Type | Description | Required |
  |------|------|-------------|----------|
  | `nickName` | string | New nickname for the user. | No |
  | `avatarUrl` | string | New avatar URL for the user. | No |
  | `gender` | integer | User's gender. 0: unknown, 1: male, 2: female.  | No |
  | `country` | string |  | No |
  | `province` | string |  | No |
  | `city` | string |  | No |
**Responses**:
- **`200`**: User profile updated successfully.
  - Content-Type: `application/json`
    Schema: [User](#schema-user)
- **`400`**: Invalid input.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `POST` /users/avatar
**Summary**: Update user avatar URL
**Tags**: User
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Properties:
  | Name | Type | Description | Required |
  |------|------|-------------|----------|
  | `avatarUrl` | string | New avatar URL. | Yes |
**Responses**:
- **`200`**: Avatar updated successfully.
  - Content-Type: `application/json`
    Schema: [User](#schema-user)
- **`400`**: Invalid input (e.g., missing avatarUrl).
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `GET` /users/settings
**Summary**: Get user settings
**Tags**: User
**Security**:
- `bearerAuth` (No scopes)
**Responses**:
- **`200`**: User settings retrieved successfully.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `notifications_enabled` | boolean |  | No |
    | `theme` | string |  | No |
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
### `PUT` /users/settings
**Summary**: Update user settings
**Tags**: User
**Security**:
- `bearerAuth` (No scopes)
**Request Body**:
- Content-Type: `application/json`
  Properties:
  | Name | Type | Description | Required |
  |------|------|-------------|----------|
  | `notifications_enabled` | boolean |  | No |
  | `theme` | string |  | No |
**Responses**:
- **`200`**: User settings updated successfully.
  - Content-Type: `application/json`
    Properties:
    | Name | Type | Description | Required |
    |------|------|-------------|----------|
    | `notifications_enabled` | boolean |  | No |
    | `theme` | string |  | No |
- **`400`**: Invalid input.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`401`**: Unauthorized.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)
- **`500`**: Server error.
  - Content-Type: `application/json`
    Schema: [ErrorResponse](#schema-errorresponse)

---
## Schemas (Data Models)
<a name="schema-errorresponse"></a>
### `ErrorResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `message` | string | Error message. | No |
| `error` | object | Optional error details | No |

---
<a name="schema-wechatloginrequest"></a>
### `WeChatLoginRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `code` | string | WeChat login code. | Yes |
| `userInfo` | object |  | Yes |

---
<a name="schema-authresponse"></a>
### `AuthResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `token` | string | JWT token for authentication. | No |
| `user` | [User](#schema-user) |  | No |
| `isNewUser` | boolean | Indicates if the user is newly registered. | No |

---
<a name="schema-user"></a>
### `User`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string | User ID. | No |
| `openId` | string | WeChat OpenID. | No |
| `nickName` | string | User's nickname. | No |
| `avatarUrl` | string | URL of the user's avatar. | No |
| `gender` | integer | User's gender. 0: unknown, 1: male, 2: female.  | No |
| `country` | string |  | No |
| `province` | string |  | No |
| `city` | string |  | No |
| `points_balance` | integer |  | No |
| `experience` | integer |  | No |
| `last_checkin_date` | string |  | No |
| `checkin_streak` | integer |  | No |
| `created_at` | string |  | No |
| `updated_at` | string |  | No |

---
<a name="schema-checkinstatusresponse"></a>
### `CheckinStatusResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `checked_in_today` | boolean | Whether the user has checked in today. | No |
| `current_streak` | integer | User's current check-in streak. | No |
| `last_checkin_date` | string | The date of the last check-in. | No |
| `monthly_checkins` | array of string | List of dates checked in this month. | No |

---
<a name="schema-checkinresponse"></a>
### `CheckinResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `message` | string |  | No |
| `points_earned` | integer |  | No |
| `xp_gained` | integer |  | No |
| `current_streak` | integer |  | No |
| `user` | [User](#schema-user) |  | No |

---
<a name="schema-retroactivecheckinrequest"></a>
### `RetroactiveCheckinRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `date` | string | The past date to perform a retroactive check-in for (YYYY-MM-DD). | Yes |

---
<a name="schema-interactionlog"></a>
### `InteractionLog`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string |  | No |
| `user_id` | string |  | No |
| `pet_id` | string |  | No |
| `interaction_type` | string | Type of interaction. | No |
| `details` | object | Specific details about the interaction (e.g., item_used, skill_learned). | No |
| `points_earned` | integer |  | No |
| `xp_gained` | integer |  | No |
| `happiness_change` | integer |  | No |
| `health_change` | integer |  | No |
| `created_at` | string |  | No |

---
<a name="schema-interactionrequest"></a>
### `InteractionRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `interaction_type` | string | The type of interaction to perform. | Yes |
| `details` | object | Additional details for the interaction (e.g., item_id for feeding). | No |

---
<a name="schema-interactionresponse"></a>
### `InteractionResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `message` | string |  | No |
| `pet_status` | [Pet](#schema-pet) |  | No |
| `rewards` | object |  | No |

---
<a name="schema-leaderboardentry"></a>
### `LeaderboardEntry`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `rank` | integer |  | No |
| `user_id` | string |  | No |
| `username` | string |  | No |
| `pet_id` | string |  | No |
| `pet_name` | string |  | No |
| `score` | integer |  | No |
| `avatar_url` | string |  | No |

---
<a name="schema-userrank"></a>
### `UserRank`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `rank` | integer |  | No |
| `score` | integer |  | No |
| `total_participants` | integer |  | No |
| `leaderboard_type` | string |  | No |

---
<a name="schema-product"></a>
### `Product`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string |  | No |
| `name` | string |  | No |
| `description` | string |  | No |
| `product_type` | string |  | No |
| `price_points` | integer |  | No |
| `stock_quantity` | integer |  | No |
| `image_url` | string |  | No |
| `tags` | array of string |  | No |
| `availability_start_date` | string |  | No |
| `availability_end_date` | string |  | No |
| `created_at` | string |  | No |
| `updated_at` | string |  | No |

---
<a name="schema-order"></a>
### `Order`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string |  | No |
| `user_id` | string |  | No |
| `product_id` | string |  | No |
| `quantity` | integer |  | No |
| `total_price_points` | integer |  | No |
| `status` | string |  | No |
| `transaction_details` | object |  | No |
| `created_at` | string |  | No |
| `updated_at` | string |  | No |

---
<a name="schema-userinventoryitem"></a>
### `UserInventoryItem`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string |  | No |
| `user_id` | string |  | No |
| `product_id` | string |  | No |
| `product_name` | string |  | No |
| `quantity` | integer |  | No |
| `acquired_date` | string |  | No |
| `last_used_date` | string |  | No |
| `metadata` | object |  | No |

---
<a name="schema-createorderrequest"></a>
### `CreateOrderRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `product_id` | string |  | Yes |
| `quantity` | integer |  | Yes |

---
<a name="schema-pet"></a>
### `Pet`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `_id` | string |  | No |
| `owner_id` | string | ID of the user who owns the pet. | No |
| `name` | string | Pet's name. | No |
| `pet_type_id` | string | Identifier for the type of pet (e.g., 'cat_01', 'dog_02'). | No |
| `appearance_details` | object | Details about the pet's appearance (e.g., color, breed, image URL). | No |
| `happiness` | integer |  | No |
| `health` | integer |  | No |
| `level` | integer |  | No |
| `experience_points` | integer |  | No |
| `created_at` | string |  | No |
| `updated_at` | string |  | No |

---
<a name="schema-petuploadphotorequest"></a>
### `PetUploadPhotoRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `image_data_mock` | string | Mock image data or URL for pet photo. | No |

---
<a name="schema-petuploadphotoresponse"></a>
### `PetUploadPhotoResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `message` | string |  | No |
| `photo_id_mock` | string | Mock ID for the uploaded photo. | No |

---
<a name="schema-petgeneraterequest"></a>
### `PetGenerateRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `photo_id_mock` | string | Mock ID of the uploaded photo to base generation on. | No |
| `custom_prompt` | string | Optional custom prompt for AI generation. | No |

---
<a name="schema-petgenerateresponse"></a>
### `PetGenerateResponse`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `generated_pet_options` | array of object |  | No |

---
<a name="schema-petadoptrequest"></a>
### `PetAdoptRequest`
Properties:
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `temp_pet_id` | string | Temporary ID of the pet chosen from generation options. | Yes |
| `name` | string | Name chosen for the pet. | Yes |

---
