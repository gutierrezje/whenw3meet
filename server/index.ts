import { capsule, mutation, query, string, table } from "lakebed/server";

export default capsule({
  name: "whenw3meet",

  schema: {
    events: table({
      name: string(),
      dates: string(), // JSON string representing date array
      startTime: string(),
      endTime: string()
    }),
    availabilities: table({
      eventId: string(),
      userName: string(),
      passwordHash: string(),
      slots: string() // JSON string representing availability map
    })
  },

  queries: {
    events: query((ctx) => ctx.db.events.all()),
    availabilities: query((ctx) => ctx.db.availabilities.all())
  },

  mutations: {
    createEvent: mutation((ctx, name: string, dates: string, startTime: string, endTime: string) => {
      const event = ctx.db.events.insert({ name, dates, startTime, endTime });
      return event.id;
    }),
    saveAvailability: mutation((ctx, eventId: string, userName: string, passwordHash: string, slots: string) => {
      const existing = ctx.db.availabilities
        .where("eventId", eventId)
        .where("userName", userName)
        .all();

      if (existing.length > 0) {
        if (existing[0].passwordHash === passwordHash) {
          ctx.db.availabilities.update(existing[0].id, { slots });
          return { success: true };
        } else {
          return { success: false, error: "Incorrect PIN" };
        }
      }

      ctx.db.availabilities.insert({ eventId, userName, passwordHash, slots });
      return { success: true };
    })
  }
});
