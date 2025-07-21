# Test Preview Environment

This folder contains isolated components for testing live website preview functionality without affecting the main codebase.

## Structure

```
test-preview/
├── components/
│   ├── IframePreview.tsx      # Iframe component with error handling
│   ├── LivePreviewModal.tsx   # Modal for displaying previews
│   ├── PreviewButton.tsx      # Button component for triggering previews
│   └── ScreenshotPreview.tsx  # Screenshot API integration component
├── services/
│   ├── screenshotService.ts   # ScreenshotOne API integration
│   └── previewService.ts      # Hybrid preview logic
├── utils/
│   ├── cache.ts              # Caching utilities
│   └── constants.ts          # Configuration constants
├── test-app/
│   ├── TestApp.tsx           # Test application
│   └── index.html            # Test HTML file
└── README.md                 # This file
```

## Testing Strategy

1. **Iframe Testing**: Test which portfolio websites allow iframe embedding
2. **Screenshot API**: Test ScreenshotOne integration with sample URLs
3. **Hybrid System**: Combine iframe + screenshot fallback
4. **Performance**: Test caching and loading states
5. **Error Handling**: Test various failure scenarios

## Usage

This is an isolated testing environment. Once components are tested and working, they will be integrated into the main application.

## API Keys

For testing, we'll use ScreenshotOne's free tier (100 screenshots/month).
API keys will be stored in environment variables.
