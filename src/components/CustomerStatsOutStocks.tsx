import { Ban, Check, Edit, Search, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductType } from "../../type";
import { getProducts } from "@/helpers/getProducts";
import { fetchJsonData } from "@/helpers/getJSONData";
import { updateJsonFile } from "@/helpers/updateJSONData";

const CustomerStatsOutStocks = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<ProductType[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editedProduct, setEditedProduct] = useState<ProductType | null>(null);
    const [jsonData, setJsonData] = useState<any[]>([]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const openEditPopup = (product: ProductType) => {
        setSelectedProduct(product);
        setEditedProduct({ ...product }); // Create a copy of the selected product for editing
        setIsEditPopupOpen(true);
    };

    const closeEditPopup = () => {
        setIsEditPopupOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof ProductType) => {
        if (editedProduct) {
            setEditedProduct({ ...editedProduct, [key]: e.target.value });
        }
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const allProducts = await getProducts();
                setProducts(allProducts);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (typeof window !== "undefined") {
            fetchData();
        }
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchJsonData("robotech/pages/categories.json");
                setJsonData(data);


            } catch (error) {
            }
        };

        fetchData();
    }, []);


    const handleSave = async () => {
        if (editedProduct) {
            console.log("Edited Product:", editedProduct);
            setIsEditPopupOpen(false);
            setEditedProduct(null);

            // Check if jsonData is not empty and it contains the necessary data structure
            if (jsonData.length > 0 && Array.isArray(jsonData[0][editedProduct.category])) {
                let updatedData = [...jsonData];

                // Use map to update the array
                updatedData[0][editedProduct.category] = updatedData[0][editedProduct.category].map(product => {
                    if (+product.id === +editedProduct.id) {
                        console.log("done", editedProduct);
                        return editedProduct;
                    } else {
                        return product; // Return other products unchanged
                    }
                });

                // Update the state with the modified data
                setJsonData(updatedData);

                await updateJsonFile("robotech/pages/categories.json", jsonData);


            } else {
                console.error("jsonData is empty or does not contain the expected structure.");
            }
        }
    };


    useEffect((
    ) => { console.log(jsonData) }, [jsonData])
    return (
        <div className="border-red-400 overflow-auto  border-2 bg-white my-5 px-3 py-6 rounded-lg shadow-md animate-fade-in">
            <h2 className="font-semibold mb-6 flex items-center justify-center text-red-500 bg-red-100 py-2 px-4 rounded-md">
                <Ban className="mr-2 text-red-500" size={22} /> Out-Stocks
                <span className="mx-4 relative">
                    <Search className="w-5 h-5 text-gray-500 absolute top-2 right-3" />
                    <input
                        type="text"
                        placeholder="Product Name..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="pl-2 pr-10  placeholder-red-300 py-1 text-sm border border-red-200 rounded focus:outline-none focus:border-red-500"
                    />
                </span>
                <span className="ml-auto text-sm">
                    {products &&
                        products.filter((product) => +product?.count === 0).length}{' '}
                    Item(s)
                </span>
            </h2>

            <div className="mb-3 h-[380px] overflow-auto py-3 px-2 rounded-md">
                {products &&
                    products
                        .filter((product) => +product?.count === 0)
                        .filter((product) =>
                            product.title.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((product) => (
                            <div
                                className="flex  items-center justify-start gap-1 border-b border-gray-300 py-2"
                                key={`${product.id}_${product.title}`}
                            >
                                <img
                                    className="w-8 h-8 rounded"
                                    src={product?.image1}
                                    alt={product.title}
                                />{' '}
                                <div className="pl-3 text-sm overflow-hidden text-ellipsis">{product.title}</div>
                                <div className="ml-auto">
                                    <button
                                        className="mr-1"
                                        onClick={() => openEditPopup(product)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
            </div>

            {/* Popup */}
            {isEditPopupOpen && editedProduct && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white max-h-[700px] overflow-auto min-w-[600px] p-8 rounded-lg shadow-md">
                        <h2 className="font-bold mb-2 text-center text-lg">Edit Product</h2>
                        <div className="">
                            {Object.entries({
                                title: 'Title',
                                description: 'Description',
                                price: 'Price',
                                wholesalePrice: 'Wholesale Price', // Add the Wholesale Price field
                                previousPrice: 'Previous Price',
                                count: 'Count',
                                image1: 'Image1',
                                image2: 'Image2',
                                image3: 'Image3',
                                externalLink: "External Link",
                            }).map(([key, placeholder], index) => (
                                <div key={key} className={`flex-col mb-2 lg:pr-4`}>
                                    <span className="font-bold text-sm mb-2 inline-block ml-1">{placeholder}</span>
                                    {key === 'description' ? (
                                        <textarea
                                            placeholder={placeholder}
                                            className={`border border-gray-300 rounded outline-none w-full p-2 `}
                                            value={editedProduct[key]}
                                            onChange={(e) => handleInputChange(e, key as keyof ProductType)}
                                        />
                                    ) : (
                                        <input
                                            type={key === 'price' || key === 'wholesalePrice' ? 'number' : 'text'} // Set the type for price and wholesalePrice to 'number'
                                            placeholder={placeholder}
                                            className={`border border-gray-300 rounded outline-none w-full p-2 `}
                                            value={editedProduct[key]}
                                            onChange={(e) => handleInputChange(e, key as keyof ProductType)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <button
                                className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={handleSave}
                            >
                                <Check size={18} className="mr-1" />
                                Save
                            </button>
                            <button
                                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                onClick={closeEditPopup}
                            >
                                <X size={18} className="mr-1" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerStatsOutStocks;
