import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, query, cityRef } = await req.json();
    const API_KEY = process.env.NOVA_POSHTA_API_KEY;

    let modelName = "Address";
    let calledMethod = "";
    let methodProperties = {};

    if (action === "getCities") {
      calledMethod = "searchSettlements";
      methodProperties = { CityName: query, Limit: "50" };
    } else if (action === "getWarehouses") {
      calledMethod = "getWarehouses";
      methodProperties = { CityRef: cityRef, Limit: "200" };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName,
        calledMethod,
        methodProperties,
      }),
    });

    const data = await response.json();

    if (action === "getCities") {
      const cities = data.data[0]?.Addresses.map((city: any) => ({
        ref: city.DeliveryCity,
        name: city.Present,
      })) || [];
      return NextResponse.json(cities);
    } 
    
    if (action === "getWarehouses") {
      const warehouses = data.data.map((wh: any) => ({
        ref: wh.Ref,
        description: wh.Description,
      })) || [];
      return NextResponse.json(warehouses);
    }

  } catch (error) {
    return NextResponse.json({ error: "NP API Error" }, { status: 500 });
  }
}