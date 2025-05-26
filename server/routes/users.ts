// Endpoint voor het verwijderen van gebruikersgegevens
router.delete("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Controleer of de gebruiker bestaat
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden" });
    }

    // Anonimiseer eerst de gegevens
    await storage.anonymizeUser(userId);

    // Verwijder daarna de gebruiker
    await storage.deleteUser(userId);

    // Log de verwijdering
    await storage.logDataDeletion({
      userId,
      timestamp: new Date(),
      reason: "Gebruiker verzoek",
      type: "volledige verwijdering"
    });

    res.status(200).json({ message: "Gebruikersgegevens succesvol verwijderd" });
  } catch (error) {
    console.error("Fout bij verwijderen gebruikersgegevens:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het verwijderen van de gegevens" });
  }
});

// Endpoint voor het anonimiseren van gebruikersgegevens
router.patch("/:id/anonymize", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Controleer of de gebruiker bestaat
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden" });
    }

    // Anonimiseer de gegevens
    await storage.anonymizeUser(userId);

    // Log de anonimisering
    await storage.logDataDeletion({
      userId,
      timestamp: new Date(),
      reason: "Gebruiker verzoek",
      type: "anonimisering"
    });

    res.status(200).json({ message: "Gebruikersgegevens succesvol geanonimiseerd" });
  } catch (error) {
    console.error("Fout bij anonimiseren gebruikersgegevens:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het anonimiseren van de gegevens" });
  }
}); 