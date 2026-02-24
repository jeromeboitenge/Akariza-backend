#!/bin/bash

# Add ApiTags to all controllers
for file in src/*/*.controller.ts; do
  module=$(basename $(dirname $file))
  tag=$(echo $module | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
  
  # Check if ApiTags already exists
  if ! grep -q "@ApiTags" "$file"; then
    # Add import if not exists
    if ! grep -q "ApiTags" "$file"; then
      sed -i "1i import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';" "$file"
    fi
    
    # Add @ApiTags before @Controller
    sed -i "/@Controller/i @ApiTags('$tag')\n@ApiBearerAuth('JWT-auth')" "$file"
  fi
done

echo "✅ Swagger tags added to all controllers"
