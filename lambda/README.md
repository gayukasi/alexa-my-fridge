# Alexa Sort My Fridge — Lambda Function

AWS Lambda function for the Alexa Custom Skill that manages fridge inventory via Supabase.

## Supabase Setup

Create an `inventory` table in your Supabase project:

```sql
create table if not exists inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  location text not null default 'fridge',
  added_at timestamptz not null default now(),
  expires_at date
);

alter table inventory enable row level security;

create policy "Service key full access" on inventory
  for all using (true) with check (true);
```

## Alexa Skill Interaction Model

In the Alexa Developer Console, create a custom skill with this intent schema:

```json
{
  "intents": [
    {
      "name": "AddInventoryIntent",
      "slots": [
        { "name": "action", "type": "AMAZON.SearchQuery" },
        { "name": "item", "type": "AMAZON.SearchQuery" },
        { "name": "category", "type": "AMAZON.SearchQuery" },
        { "name": "location", "type": "AMAZON.SearchQuery" }
      ],
      "samples": [
        "{action} {item} to {category}",
        "{action} {item} to {category} in the {location}",
        "{action} {item} from {category}",
        "{action} {item}",
        "put {item} in {category}",
        "put {item} in the {location}",
        "{action} {item} from the {location}"
      ]
    }
  ]
}
```

## Lambda Deployment

### 1. Install dependencies

```bash
cd lambda
npm install
```

### 2. Create the deployment zip

```bash
npm run zip
```

This creates `lambda.zip` with the handler and `node_modules`.

### 3. Create the Lambda function

```bash
aws lambda create-function \
  --function-name alexa-sort-my-fridge \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --zip-file fileb://lambda.zip \
  --timeout 10 \
  --memory-size 128 \
  --environment "Variables={SUPABASE_URL=https://xeisfknkhsarimbzlyzz.supabase.co,SUPABASE_SERVICE_KEY=your-service-role-key}"
```

### 4. Update an existing function

```bash
aws lambda update-function-code \
  --function-name alexa-sort-my-fridge \
  --zip-file fileb://lambda.zip
```

### 5. Add Alexa trigger

```bash
aws lambda add-permission \
  --function-name alexa-sort-my-fridge \
  --statement-id alexa-skill \
  --action lambda:InvokeFunction \
  --principal alexa-appkit.amazon.com \
  --event-source-token YOUR_ALEXA_SKILL_ID
```

### 6. Connect to Alexa

In the Alexa Developer Console under **Endpoint**, select **AWS Lambda ARN** and paste your function's ARN.

## Environment Variables

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `SUPABASE_URL`        | Your Supabase project URL            |
| `SUPABASE_SERVICE_KEY`| Supabase service role key (not anon) |

## Testing

Use the **Alexa Developer Console Test tab** or the AWS Lambda test console with a sample event:

```json
{
  "version": "1.0",
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "AddInventoryIntent",
      "slots": {
        "action": { "name": "action", "value": "add" },
        "item": { "name": "item", "value": "milk" },
        "category": { "name": "category", "value": "dairy" },
        "location": { "name": "location", "value": "fridge" }
      }
    }
  }
}
```
