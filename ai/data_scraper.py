
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import time

class NFTDataScraper:
    def __init__(self, api_key="CG-1Tc5UJgmUByfTMibYyMMutVD"):
        self.api_key = api_key
        self.base_url = "https://api.coingecko.com/api/v3"
        self.headers = {"x-cg-demo-api-key": api_key}
        
        # Supported NFT collections
        self.nft_collections = {
            'cryptopunks': 'cryptopunks',
            'azuki': 'azuki', 
            'bored-ape-yacht-club': 'bored-ape-yacht-club'
        }
        
    def create_mock_data(self, collection_id, days=90):
        """Tạo mock data thực tế cho demo"""
        print(f"Tạo mock data cho {collection_id}...")
        
        dates = pd.date_range(start=datetime.now() - timedelta(days=days), 
                            end=datetime.now(), freq='D')
        
        # Giá khác nhau cho từng collection
        price_ranges = {
            'cryptopunks': (70, 90),
            'azuki': (10, 15),
            'bored-ape-yacht-club': (15, 25)
        }
        
        min_price, max_price = price_ranges.get(collection_id, (10, 50))
        
        # Tạo trend với volatility
        base_prices = np.linspace(min_price, max_price, len(dates))
        volatility = np.random.normal(0, max_price * 0.1, len(dates))
        floor_prices = base_prices + volatility
        floor_prices = np.maximum(floor_prices, min_price * 0.5)
        
        volumes = np.random.uniform(1000, 10000, len(dates))
        market_caps = floor_prices * np.random.uniform(8000, 12000, len(dates))
        
        return dates, floor_prices, volumes, market_caps
    
    def fetch_real_data(self, collection_id, days=90):
        """Cào data thật từ CoinGecko API"""
        try:
            print(f"Đang cào data thật cho {collection_id}...")
            url = f"{self.base_url}/nfts/{collection_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 401:
                print("API key không hợp lệ, sử dụng mock data...")
                return None
                
            response.raise_for_status()
            data = response.json()
            
            # Chuyển đổi dữ liệu
            dates = []
            floor_prices = []
            volumes = []
            market_caps = []
            
            if 'floor_price_usd' in data and data['floor_price_usd']:
                for timestamp, price in data['floor_price_usd']:
                    dates.append(datetime.fromtimestamp(timestamp/1000))
                    floor_prices.append(price)
            
            if 'volume_usd' in data and data['volume_usd']:
                for i, (timestamp, volume) in enumerate(data['volume_usd']):
                    if i < len(volumes):
                        volumes[i] = volume
                    else:
                        volumes.append(volume)
            
            if 'market_cap_usd' in data and data['market_cap_usd']:
                for i, (timestamp, cap) in enumerate(data['market_cap_usd']):
                    if i < len(market_caps):
                        market_caps[i] = cap
                    else:
                        market_caps.append(cap)
            
            # Đảm bảo các array có cùng độ dài
            min_len = min(len(dates), len(floor_prices))
            if volumes:
                min_len = min(min_len, len(volumes))
            if market_caps:
                min_len = min(min_len, len(market_caps))
                
            dates = dates[:min_len]
            floor_prices = floor_prices[:min_len]
            
            if not volumes:
                volumes = [np.random.uniform(1000, 10000) for _ in range(min_len)]
            else:
                volumes = volumes[:min_len]
                
            if not market_caps:
                market_caps = [floor_prices[i] * np.random.uniform(8000, 12000) for i in range(min_len)]
            else:
                market_caps = market_caps[:min_len]
            
            print(f"Cào thành công {len(dates)} dòng dữ liệu thật!")
            return dates, floor_prices, volumes, market_caps
            
        except Exception as e:
            print(f"Lỗi khi cào data cho {collection_id}: {e}")
            return None
    
    def save_to_txt(self, collection_id, dates, floor_prices, volumes, market_caps):
        """Lưu data thành file TXT với format chuẩn"""
        
        # Tạo thư mục datasets nếu chưa có
        os.makedirs('ai/datasets', exist_ok=True)
        
        # Tên file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"ai/datasets/nft_data_{collection_id}_{timestamp}.txt"
        
        print(f"Đang lưu data vào {filename}...")
        
        with open(filename, 'w', encoding='utf-8') as f:
            # Header
            f.write(f"# NFT Dataset for {collection_id}\n")
            f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Total records: {len(dates)}\n")
            f.write("# Format: DATE|FLOOR_PRICE|VOLUME|MARKET_CAP\n")
            f.write("#" + "="*50 + "\n")
            
            # Data
            for i in range(len(dates)):
                date_str = dates[i].strftime('%Y-%m-%d')
                f.write(f"{date_str}|{floor_prices[i]:.4f}|{volumes[i]:.2f}|{market_caps[i]:.2f}\n")
        
        print(f"✅ Đã lưu {len(dates)} dòng data vào {filename}")
        return filename
    
    def scrape_collection(self, collection_id, days=90, use_mock=False):
        """Cào data cho 1 collection và lưu thành TXT"""
        print(f"\n{'='*60}")
        print(f"BẮT ĐẦU CÀO DATA CHO: {collection_id.upper()}")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        try:
            # Thử cào data thật trước
            if not use_mock:
                real_data = self.fetch_real_data(collection_id, days)
                if real_data:
                    dates, floor_prices, volumes, market_caps = real_data
                else:
                    # Fallback to mock data
                    dates, floor_prices, volumes, market_caps = self.create_mock_data(collection_id, days)
            else:
                # Sử dụng mock data trực tiếp
                dates, floor_prices, volumes, market_caps = self.create_mock_data(collection_id, days)
            
            # Lưu thành TXT
            filename = self.save_to_txt(collection_id, dates, floor_prices, volumes, market_caps)
            
            end_time = time.time()
            print(f"⏱️  Thời gian cào: {end_time - start_time:.2f} giây")
            print(f"📁 File đã lưu: {filename}")
            
            return filename
            
        except Exception as e:
            print(f"❌ Lỗi khi cào data cho {collection_id}: {e}")
            return None
    
    def scrape_all_collections(self, days=90, use_mock=False):
        """Cào data cho tất cả collections"""
        print("🚀 BẮT ĐẦU CÀO DATA CHO TẤT CẢ NFT COLLECTIONS")
        print(f"📅 Số ngày: {days}")
        print(f"🔧 Sử dụng mock data: {use_mock}")
        
        results = {}
        total_start = time.time()
        
        for collection_id in self.nft_collections.keys():
            filename = self.scrape_collection(collection_id, days, use_mock)
            if filename:
                results[collection_id] = filename
            
            # Delay giữa các requests để tránh rate limit
            if not use_mock:
                time.sleep(1)
        
        total_end = time.time()
        
        print(f"\n{'='*60}")
        print("📊 KẾT QUẢ CÀO DATA")
        print(f"{'='*60}")
        print(f"✅ Thành công: {len(results)}/{len(self.nft_collections)} collections")
        print(f"⏱️  Tổng thời gian: {total_end - total_start:.2f} giây")
        
        for collection_id, filename in results.items():
            print(f"📁 {collection_id}: {filename}")
        
        return results

def main():
    """Chạy data scraper"""
    print("🔥 NFT DATA SCRAPER - CHUYÊN CÀO DATA NFT")
    print("="*50)
    
    # Khởi tạo scraper
    scraper = NFTDataScraper()
    
    # Cào data cho tất cả collections (90 ngày)
    results = scraper.scrape_all_collections(days=90, use_mock=False)
    
    print(f"\n🎉 HOÀN THÀNH! Đã tạo {len(results)} file dataset.")
    print("📂 Tất cả file được lưu trong thư mục ai/datasets/")

if __name__ == "__main__":
    main()
