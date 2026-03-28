import app from "@/backend/hono";

export async function GET(request: Request) {
  try {
    console.log('API Route GET:', request.url);
    const response = await app.fetch(request);
    console.log('API Response status:', response.status);
    return response;
  } catch (error) {
    console.error('API Route GET error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('API Route POST:', request.url);
    const response = await app.fetch(request);
    console.log('API Response status:', response.status);
    return response;
  } catch (error) {
    console.error('API Route POST error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request) {
  try {
    return await app.fetch(request);
  } catch (error) {
    console.error('API Route PUT error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    return await app.fetch(request);
  } catch (error) {
    console.error('API Route DELETE error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS(request: Request) {
  try {
    return await app.fetch(request);
  } catch (error) {
    console.error('API Route OPTIONS error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
