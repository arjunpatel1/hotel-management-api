const PageContent = require('../../model/schema/pageContent');

const postContent = async (req, res) => {
    try {
        const { htmlContent, page } = req.body;
      
        const { hotelId } = req.params;

        const updated = await PageContent.findOneAndUpdate(
            {
                page: page,
                hotelId: hotelId
            },
            { htmlContent },
            { upsert: true, new: true }
        )

        res.status(200).json({ htmlContent: updated, message: "content saved successfully" });
    } catch (error) {
        console.error("Failed to save content:", error);
        res.status(500).json({ error: "Failed to save content" });
    }
}

const getPageContent = async (req, res) => {
    try {

        const { hotelId, page } = req.params;
        const htmlContent = await PageContent.findOne({
            page: page,
            hotelId: hotelId
        });

        res.status(200).json({ htmlContent: htmlContent, message: "content fetched successfully" });
    } catch (error) {
        console.error("Failed to get content:", error);
        res.status(500).json({ error: "Failed to fetch content" });
    }
}

module.exports = { postContent, getPageContent };