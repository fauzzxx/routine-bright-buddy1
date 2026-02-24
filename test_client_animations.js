// Test client-side video generation
import { generateRoutineVideo } from '@/integrations/demo/video';

async function testClientSideAnimations() {
  console.log('🎬 Testing client-side video generation...');
  
  const testRoutines = [
    {
      title: "Morning Routine",
      frames: [
        { title: "Brush your teeth", description: "Use toothbrush and toothpaste", icon: "🪥" },
        { title: "Eat breakfast", description: "Have a healthy meal", icon: "🥞" },
        { title: "Get dressed", description: "Put on clean clothes", icon: "👕" }
      ]
    },
    {
      title: "Bedtime Routine", 
      frames: [
        { title: "Take a bath", description: "Wash your body", icon: "🛁" },
        { title: "Put on pajamas", description: "Wear comfy clothes", icon: "🛌" },
        { title: "Read a book", description: "Choose a story", icon: "📚" }
      ]
    }
  ];
  
  for (const routine of testRoutines) {
    console.log(`\n🎭 Testing routine: ${routine.title}`);
    try {
      const result = await generateRoutineVideo(routine.title, routine.frames);
      console.log(`   ✅ Success! Generated video: ${result.url}`);
      console.log(`   📊 Duration: ${result.durationSec}s, Type: ${result.mimeType}`);
      console.log(`   💾 Is blob: ${result.isBlob}`);
      
      // Test if video can be played
      if (result.url) {
        const testVideo = document.createElement('video');
        testVideo.src = result.url;
        testVideo.style.display = 'none';
        document.body.appendChild(testVideo);
        
        testVideo.onloadedmetadata = () => {
          console.log(`   🎥 Video loaded successfully! Duration: ${testVideo.duration}s`);
          document.body.removeChild(testVideo);
          URL.revokeObjectURL(result.url);
        };
        
        testVideo.onerror = () => {
          console.log(`   ⚠️  Video failed to load`);
          document.body.removeChild(testVideo);
        };
      }
    } catch (error) {
      console.error(`   ❌ Error generating video:`, error);
    }
  }
  
  console.log('\n✨ Client-side animation test complete!');
}

// Run the test
testClientSideAnimations();