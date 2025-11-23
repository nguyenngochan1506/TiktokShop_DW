"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { SaveIcon, RefreshCwIcon, SettingsIcon } from "lucide-react";
import { updateSetting } from "@/app/actions/settings";
import { Chip } from "@heroui/chip";

interface SettingItem {
  key: string;
  value: string;
  type: string;
  group: string;
  description: string | null;
}

export default function SettingsEditor({ settings }: { settings: SettingItem[] }) {
  // Group settings by 'group' field
  const groupedSettings = settings.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {} as Record<string, SettingItem[]>);

  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  const handleSave = async (key: string, newValue: string) => {
    setLoadingKeys(prev => ({ ...prev, [key]: true }));
    
    const res = await updateSetting(key, newValue);
    
    if (res.error) {
        alert("Failed to save");
    }
    
    setLoadingKeys(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs aria-label="Settings Groups" color="primary" variant="underlined">
        {Object.keys(groupedSettings).map((group) => (
          <Tab key={group} title={group}>
            <Card>
              <CardBody className="gap-6 p-6">
                {groupedSettings[group].map((setting) => (
                  <div key={setting.key} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-default-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{setting.key}</p>
                          <Chip size="sm" variant="flat" className="text-[10px] h-5">{setting.type}</Chip>
                      </div>
                      <p className="text-small text-default-500">{setting.description}</p>
                    </div>

                    <div className="w-full sm:w-64 flex items-center gap-2">
                      {setting.type === 'boolean' ? (
                        <Switch 
                          defaultSelected={setting.value === 'true'}
                          onValueChange={(val) => handleSave(setting.key, String(val))}
                          isDisabled={loadingKeys[setting.key]}
                        >
                            {setting.value === 'true' ? "Enabled" : "Disabled"}
                        </Switch>
                      ) : (
                        <div className="flex w-full gap-2">
                            <Input 
                                defaultValue={setting.value}
                                type={setting.type === 'number' ? 'number' : 'text'}
                                size="sm"
                                variant="bordered"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleSave(setting.key, e.currentTarget.value)
                                }}
                                onBlur={(e) => {
                                    // Optional: Auto save on blur or specific logic
                                }}
                            />
                            <Button 
                                isIconOnly 
                                size="sm" 
                                color="primary" 
                                variant="flat"
                                isLoading={loadingKeys[setting.key]}
                                onPress={(e) => {
                                   const input = e.target.closest('div')?.querySelector('input');
                                   if(input) handleSave(setting.key, input.value);
                                }}
                            >
                                <SaveIcon size={16}/>
                            </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}